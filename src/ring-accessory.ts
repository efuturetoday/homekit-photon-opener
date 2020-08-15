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

export class RingDetector extends AbstractAccessory {

    private motionDetected: boolean = false

    private readonly motionService: Service;

    private timeout: NodeJS.Timer | undefined;

    constructor(hap: HAP, log: Logging, name: string, particle: any, config: any) {
        super(hap, log, name, particle, config);

        this.motionService = new hap.Service.MotionSensor(name);
        this.motionService.getCharacteristic(hap.Characteristic.MotionDetected)
            .on(CharacteristicEventTypes.GET, this.handleSwitchGet.bind(this));

        this.bindParticleEvent('ring', this.handleParticleEvent.bind(this));
    }

    handleSwitchGet(callback: CharacteristicGetCallback) {
        this.log.debug('HOMEKIT GET: motionDetected', this.motionDetected)
        callback(undefined, this.motionDetected);
    }

    handleParticleEvent(event: any) {
        this.motionDetected = true;
        this.motionService.setCharacteristic(this.hap.Characteristic.MotionDetected, this.motionDetected);

        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
            this.motionDetected = false;
            this.motionService.setCharacteristic(this.hap.Characteristic.MotionDetected, this.motionDetected);
        }, 3000);
    }

    getServices(): Service[] {
        return [
            this.informationService,
            this.motionService
        ];
    }
}
