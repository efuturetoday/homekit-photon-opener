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

export class RingToOpenSwitch extends AbstractAccessory {

    private isRTOActive: boolean = false

    private readonly switchService: Service;

    constructor(hap: HAP, log: Logging, name: string, particle: any, config: any) {
        super(hap, log, name, particle, config);

        this.switchService = new hap.Service.Switch(name);
        this.switchService.getCharacteristic(hap.Characteristic.On)
            .on(CharacteristicEventTypes.GET, this.handleSwitchGet.bind(this))
            .on(CharacteristicEventTypes.SET, this.handleSwitchSet.bind(this));

        this.bindParticleEvent('rto', this.handleParticleEvent.bind(this));
        this.pollParticleVariable();
    }


    handleSwitchGet(callback: CharacteristicGetCallback) {
        this.log.debug('HOMEKIT GET: isRTOActive', this.isRTOActive)
        callback(undefined, this.isRTOActive);
    }

    handleSwitchSet(value: CharacteristicValue, callback: CharacteristicSetCallback) {
        this.log.debug('HOMEKIT SET: isRTOActive', value);

        this.isRTOActive = value as boolean;
        this.callParticleFunction('setRTO', this.isRTOActive.toString())
            .then(() => {
                callback(undefined, this.isRTOActive);
            })
            .catch((err) => {
                callback(err);
            });
    }

    handleParticleEvent(event: any) {
        this.isRTOActive = event.data === 'true';
        this.switchService.updateCharacteristic(this.hap.Characteristic.On, this.isRTOActive);
    }

    pollParticleVariable() {
        this.getParticleVariable('isRTOActive')
            .then((response: any) => {
                this.isRTOActive = response.body.result;
                this.switchService.updateCharacteristic(this.hap.Characteristic.On, this.isRTOActive);
            }).catch((err) => {
                this.log.error(err);
            });
    }

    getServices(): Service[] {
        return [
            this.informationService,
            this.switchService
        ];
    }
}
