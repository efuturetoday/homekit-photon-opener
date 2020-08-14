import {
  CharacteristicGetCallback,
  HAP,
  Logging,
  Service,
  CharacteristicEventTypes
} from 'homebridge';
import { AbstractAccessory } from './abstract-accessory';

export class RingToOpenSwitch extends AbstractAccessory {

  private readonly switchService: Service;

  constructor(hap: HAP, log: Logging, name: string, particle: any, config: any) {
    super(hap, log, name, particle, config);

    this.switchService = new hap.Service.Switch(name);
    const onCharacteristic = this.switchService.getCharacteristic(hap.Characteristic.On);
    onCharacteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
      this.log('HOMEKIT GET: isRTOActive', onCharacteristic.value)
      callback(undefined, onCharacteristic.value);
    });

    this.bindParticleFunctionToCharacteristic(onCharacteristic, 'setRTO', (_) => _ ? 'true' : 'false');
    this.updateServiceByParticleVariable(this.switchService.getCharacteristic(hap.Characteristic.On), 'isRTOActive', _ => _.body.result).then((_: boolean) => this.isMuted = _);
  }

  getServices(): Service[] {
    return [
      this.informationService,
      this.switchService
    ];
  }
}