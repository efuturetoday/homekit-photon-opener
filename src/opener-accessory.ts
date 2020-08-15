import {
    CharacteristicGetCallback,
    HAP,
    Logging,
    Service,
    CharacteristicEventTypes,
    CharacteristicSetCallback,
    CharacteristicValue
} from 'homebridge';
import { AbstractAccessory } from './abstract-accessory';

export class DoorOpenerSwitch extends AbstractAccessory {

    private isOpenerActive: boolean = false

    private readonly switchService: Service;

    private timeout: NodeJS.Timer | undefined;

    constructor(hap: HAP, log: Logging, name: string, particle: any, config: any) {
        super(hap, log, name, particle, config);

        this.switchService = new hap.Service.Switch(name);
        this.switchService.getCharacteristic(hap.Characteristic.On)
            .on(CharacteristicEventTypes.GET, this.handleSwitchGet.bind(this))
            .on(CharacteristicEventTypes.SET, this.handleSwitchSet.bind(this));
    }


    handleSwitchGet(callback: CharacteristicGetCallback) {
        this.log.debug('HOMEKIT GET: isOpenerActive', this.isOpenerActive)
        callback(undefined, this.isOpenerActive);
    }

    handleSwitchSet(value: CharacteristicValue, callback: CharacteristicSetCallback) {
        this.log.debug('HOMEKIT SET: isOpenerActive', value);

        this.isOpenerActive = value as boolean;

        if (this.isOpenerActive) {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }

            this.callParticleFunction('open', '')
                .then(() => {
                    callback(undefined, this.isOpenerActive);
                    this.timeout = setTimeout(() => {
                        this.isOpenerActive = false;
                        this.switchService.setCharacteristic(this.hap.Characteristic.On, this.isOpenerActive);
                    }, 500);
                })
                .catch((err) => {
                    callback(err);
                });
        } else {
            callback(undefined, this.isOpenerActive);
        }
    }

    getServices(): Service[] {
        return [
            this.informationService,
            this.switchService
        ];
    }
}
