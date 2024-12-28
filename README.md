# Ecosense to MQTT
A Home Assistant add-on designed to act as a proxy between [Ecoqube](https://ecosense.io/products/ecoqube) radon devices. 

## How it Works
Ecoqube devices seem to make requests to the Ecosense API every ~10 minutes. They do not verify the servers ceritifcate though which means we can impersonate the Ecosense server and capture the data.

## Setup Instructions

### Prerequisites

- Ecoqube Device
- A 2.4Ghz WiFi Network
- Ability to Control DNS on your Network
- Home Assistant Or Ability to run docker containers

### Setup

#### MQTT Broker

Install a MQTT Broker(if you dont already have one setup)

If using Home Assistant you can do so with the following steps:

1. Navigate to the add-ons section of Home Assistant
2. Search for and then install "Mosquitto broker"
3. Create credentails to connect to the broker under configuration tab once installed. The format is as follows:
```
- username: YOUR-USERNAME-HERE
  password: YOUR-PASSWORD-HERE
```
4. Ensure you set Mosquitto broker to Start on Boot and Enable Watchdog

#### Ecosense

Installing the Ecosense Add-On. This communicates directly with the Ecoqube device.

1. Navigate to the add-ons section of Home Assistant
2. Click the 3 dots in the top right followed by Repositories
3. Add this to your repository list: https://github.com/starsoccer/ecosense
4. Next click the 3 dots in the top right again followed by Check for Updates
5. You should now be able to search and find Ecosense as an add-on. If you can not try force refreshing the webpage using f5.
6. Install the Ecosense add-on
7. Once installed navigate to the configuration tab.
8. Enter the MQTT Server port, by default this is 1883 and you can leave it as is
9. Enter the MQTT Servers IP address. Assuming you are using the Mosquitto Broker you can just enter Home Assistants IP Address
10. Enter the MQTT Username you set in the prior steps followed by the password
11. Finally Start Ecosense, set it to Start on Boot, and Enable Watchdog

#### Configure your local DNS

You need to add to your network DNS (via Pi-hole, pfSense, or some other method) the following domain to point to your Home Assistant IP address:

- api.cloud.ecosense.io

This tells the Ecosense device connected to your network that when it does an update instead of talking to the Ecosense api, to instead talk to the Ecosense add-on instead.

#### Connect the Ecosense Device

If you've done all of this correctly, the controller should begin reporting data to the Energy Smart Bridge, which in turn reports it to Mosquitto broker. Entities should be automatically created in your Home Assistant.

## Credits
 [Dave Goldberg's blog post](https://embeddedartistry.com/blog/2024/11/04/reclaim-your-data-freeing-a-wi-fi-sensor-from-the-cloud/#Replacing-Their-Servers-With-Our-Own) 