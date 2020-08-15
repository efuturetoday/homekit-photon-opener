import { AccessoryPlugin, Service, Logging, HAP, PlatformConfig, CharacteristicValue, Characteristic, CharacteristicEventTypes, CharacteristicSetCallback } from "homebridge";
import { log } from "console";

export abstract class AbstractAccessory implements AccessoryPlugin {

    name: string;

    protected readonly hap: HAP;

    protected readonly log: Logging;

    protected readonly particle: any;

    protected readonly config: PlatformConfig;

    protected readonly informationService: Service;

    constructor(hap: HAP, log: Logging, name: string, particle: any, config: PlatformConfig) {
        this.hap = hap;
        this.log = log;
        this.name = name;
        this.particle = particle;
        this.config = config;

        this.informationService = new hap.Service.AccessoryInformation()
            .setCharacteristic(hap.Characteristic.Manufacturer, 'binary-factory')
            .setCharacteristic(hap.Characteristic.Model, 'Opener');
    }

    abstract getServices(): Service[];

    getParticleVariable(name: string) {
        return new Promise((resolve, reject) => {
            this.particle.getVariable({
                deviceId: this.config.deviceId,
                name: name,
                auth: this.config.token
            }).then((data: any) => {
                this.log.info(`Device Variable "${name}" retrieved successfully:`, data);
                resolve(data);
            }, (err: any) => {
                this.log.error(`An error occurred while getting Device Variable ${name}`, err);
                reject(err);
            });
        });
    }

    callParticleFunction(name: string, argument: string) {
        return new Promise((resolve, reject) => {
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
                    resolve(returnValue);
                } else {
                    reject(new Error(returnValue));
                }
            }, (err: any) => {
                this.log.error(`An error occurred while call Device Function ${name}`, err);
                reject(err);
            });
        });
    }

    bindParticleEvent(name: string, callback: (value: any) => void) {
        this.particle.getEventStream({
            deviceId: this.config.deviceId,
            name: name,
            auth: this.config.token
        }).then((stream: any) => {
            stream.on('event', (data: any) => {
                this.log.info(`Device Event "${name}" retrieved successfully:`, data);
                callback(data);
            });
        });
    }
}
