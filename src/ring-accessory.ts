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

    private isRingActive: boolean = false

    private readonly motionService: Service;

    private timer:  NodeJS.Timeout | undefined ;

    constructor(hap: HAP, log: Logging, name: string, particle: any, config: any) {
        super(hap, log, name, particle, config);

        this.motionService = new hap.Service.MotionSensor(name);
        const motionCharacteristic = this.motionService.getCharacteristic(hap.Characteristic.MotionDetected);
        motionCharacteristic.on(CharacteristicEventTypes.GET, this.handleMotionDetectedGet.bind(this));

        this.bindParticleEventToCharacteristic(motionCharacteristic, 'ring', _ => _.data === 'true', (value) => {
            this.isRingActive = value as boolean;

            if (this.timer) {
                clearTimeout(this.timer);
            }

            this.timer = setTimeout(() => {
                this.isRingActive = false;
                motionCharacteristic.updateValue(this.isRingActive);
            }, 3000);
        });
    }

    handleMotionDetectedGet(callback: CharacteristicGetCallback) {
        this.log.debug('Triggered GET MotionDetected');
        callback(null, this.isRingActive);
    }

    getServices(): Service[] {
        return [
            this.informationService,
            this.motionService
        ];
    }
}