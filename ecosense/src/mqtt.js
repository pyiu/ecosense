import mqtt from 'mqtt';
import { CONFIG } from './config.js';
import { LOGGER } from './logger.js';

let { mqtt_host, mqtt_port, mqtt_username, mqtt_password } = CONFIG();
const MQTT = mqtt.connect(`mqtt://${mqtt_host}:${mqtt_port}`, {username: mqtt_username, password: mqtt_password});
let CONFIG_PUBLISHED = false;

const generateDeviceConfig = (
    serial_number,
    fw_version,
) => ({
    device: {
        "identifiers":[serial_number],
        "name":`Ecoqube ${serial_number}`,
        "manufacturer": "Ecosense",
        "model": "Ecoqube",
        "serial_number": serial_number,
        "sw_version": fw_version,
    }
});

export const publish_config = async (serial_number, fw_version) => {
    await MQTT.publishAsync(`homeassistant/sensor/${serial_number}/radon/config`, JSON.stringify({
        "state_topic": `homeassistant/sensor/${serial_number}/radon/state`,
        "unit_of_measurement":"Bq/m³",
        "unique_id": `${serial_number}-radon`,
        name: 'Radon',
        ...generateDeviceConfig(serial_number, fw_version),
    }), {retain: true});

    await MQTT.publishAsync(`homeassistant/sensor/${serial_number}/status/config`, JSON.stringify({
        "state_topic": `homeassistant/sensor/${serial_number}/status/state`,
        "unique_id": `${serial_number}-status`,
        "entity_category": "diagnostic",
        name: 'status',
        ...generateDeviceConfig(serial_number, fw_version),
    }), {retain: true});

    await MQTT.publishAsync(`homeassistant/sensor/${serial_number}/measurements_taken/config`, JSON.stringify({
        "state_topic": `homeassistant/sensor/${serial_number}/measurements_taken/state`,
        "unique_id": `${serial_number}-measurements_taken`,
        "entity_category": "diagnostic",
        name: 'Measurements Taken',
        ...generateDeviceConfig(serial_number, fw_version),
    }), {retain: true});

    await MQTT.publishAsync(`homeassistant/sensor/${serial_number}/device_type/config`, JSON.stringify({
        "state_topic": `homeassistant/sensor/${serial_number}/device_type/state`,
        "unique_id": `${serial_number}-device_type`,
        "entity_category": "diagnostic",
        name: 'Device Type',
        ...generateDeviceConfig(serial_number, fw_version),
    }), {retain: true});

    await MQTT.publishAsync(`homeassistant/sensor/${serial_number}/radon_dou/config`, JSON.stringify({
        "state_topic": `homeassistant/sensor/${serial_number}/radon_dou/state`,
        "unique_id": `${serial_number}-radon_dou`,
        "entity_category": "diagnostic",
        name: 'Radon DOU',
        ...generateDeviceConfig(serial_number, fw_version),
    }), {retain: true});

    await MQTT.publishAsync(`homeassistant/sensor/${serial_number}/c_factor/config`, JSON.stringify({
        "state_topic": `homeassistant/sensor/${serial_number}/c_factor/state`,
        "unique_id": `${serial_number}-c_factor`,
        "entity_category": "diagnostic",
        name: 'C Factor',
        ...generateDeviceConfig(serial_number, fw_version),
    }), {retain: true});

    CONFIG_PUBLISHED = true;
}

export const publish = async ({
    serial_number,
    radon_level,
    fw_version,
    d_status,
    p_time,
    d_type,
    radon_dou,
    c_factor,
}) => {
    LOGGER.debug({message: "Publishing to MQTT", serial_number, radon_level, fw_version});

    if (!CONFIG_PUBLISHED) {
        await publish_config(serial_number, fw_version);
    }

    await MQTT.publishAsync(`homeassistant/sensor/${serial_number}/radon/state`, radon_level.toString());
    LOGGER.trace({message: "Published radon to MQTT"});

    await MQTT.publishAsync(`homeassistant/sensor/${serial_number}/status/state`, d_status.toString());
    LOGGER.trace({message: "Published status to MQTT"});

    await MQTT.publishAsync(`homeassistant/sensor/${serial_number}/measurements_taken/state`, (p_time / 10).toString());
    LOGGER.trace({message: "Published measurements taken to MQTT"});

    await MQTT.publishAsync(`homeassistant/sensor/${serial_number}/device_type/state`, d_type.toString());
    LOGGER.trace({message: "Published device type to MQTT"});

    await MQTT.publishAsync(`homeassistant/sensor/${serial_number}/radon_dou/state`, radon_dou.toString());
    LOGGER.trace({message: "Published radon dou to MQTT"});

    await MQTT.publishAsync(`homeassistant/sensor/${serial_number}/c_factor/state`, c_factor.toString());
    LOGGER.trace({message: "Published C factor to MQTT"});
}