import { AccessoryPlugin, Service, Logging, HAP, PlatformConfig, CharacteristicValue, Characteristic, CharacteristicEventTypes, CharacteristicSetCallback } from "homebridge";
import { log } from "console";

export abstract class AbstractAccessory implements AccessoryPlugin {

    name: string;

    protected readonly log: Logging;

    protected readonly particle: any;

    protected readonly config: PlatformConfig;

    protected readonly informationService: Service;

    constructor(hap: HAP, log: Logging, name: string, particle: any, config: PlatformConfig) {
        this.log = log;
        this.name = name;
        this.particle = particle;
        this.config = config;

        this.informationService = new hap.Service.AccessoryInformation()
            .setCharacteristic(hap.Characteristic.Manufacturer, 'binary-factory')
            .setCharacteristic(hap.Characteristic.Model, 'Opener');
    }

    abstract getServices(): Service[];

    updateCharacteristicByParticleVariable(characteristic: Characteristic, name: string, transform: (data: any) => CharacteristicValue, callback?: (value: CharacteristicValue) => void) {
        return this.particle.getVariable({
            deviceId: this.config.deviceId,
            name: name,
            auth: this.config.token
        }).then((data: any) => {
            this.log.debug(data);
            const value = transform(data);
            this.log.info(`Device variable "${name}" retrieved successfully: ${value}`);

            characteristic.updateValue(value);

            if (callback) {
                callback(value);
            }

            return value;
        }, (err: any) => {
            this.log.error(`An error occurred while getting Device variable ${name}`, err);
        });
    }

    callParticleFunction(name: string, argument: string, callback: CharacteristicSetCallback) {
        this.particle.callFunction({
            deviceId: this.config.deviceId,
            name: name,
            argument: argument,
            auth: this.config.token
        }).then((data: any) => {
            this.log.debug(data);
            const returnValue = data.body.return_value;
            this.log.info(`Device Function "${name}" called succesfully with "${argument}":`, returnValue);

            if (returnValue >= 0) {
                callback();
            } else {
                callback(new Error(returnValue));
            }
        }, (err: any) => {
            callback(err);
        });


    }

    bindParticleEventToCharacteristic(characteristic: Characteristic, name: string, transform: (data: any) => CharacteristicValue, callback?: (value: CharacteristicValue) => void) {
        this.particle.getEventStream({
            deviceId: this.config.deviceId,
            name: name,
            auth: this.config.token
        }).then((stream: any) => {
            stream.on('event', (data: any) => {
                this.log.debug(data);
                const value = transform(data);
                this.log.info(`Device Event "${name}" retrieved successfully: ${value}`);
                characteristic.updateValue(value);

                if (callback) {
                    callback(value);
                }
            });
        });
    }
}
