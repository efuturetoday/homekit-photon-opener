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

export class MuteSwitch extends AbstractAccessory {

  private readonly switchService: Service;

  constructor(hap: HAP, log: Logging, name: string, particle: any, config: any) {
    super(hap, log, name, particle, config);

    this.switchService = new hap.Service.Switch(name);
    const onCharacteristic = this.switchService.getCharacteristic(hap.Characteristic.On);
    onCharacteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
      this.log('HOMEKIT GET: isMuted', onCharacteristic.value)
      callback(undefined, onCharacteristic.value);
    });

    this.bindParticleFunctionToCharacteristic(onCharacteristic, 'setMute', (_) => _ ? 'true' : 'false');
    this.updateServiceByParticleVariable(onCharacteristic, 'isMuted', _ => _.body.result).then((_: boolean) => this.isMuted = _);
    this.bindParticleEventToCharacteristic(onCharacteristic, 'mute', _ => _.data === 'true');
  }

  getServices(): Service[] {
    return [
      this.informationService,
      this.switchService
    ];
  }
}