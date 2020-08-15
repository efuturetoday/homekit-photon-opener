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

  private isMuted: boolean = false

  private readonly switchService: Service;

  constructor(hap: HAP, log: Logging, name: string, particle: any, config: any) {
    super(hap, log, name, particle, config);

    this.switchService = new hap.Service.Switch(name);
    const onCharacteristic = this.switchService.getCharacteristic(hap.Characteristic.On);
    onCharacteristic
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        this.log('HOMEKIT GET: isMuted', this.isMuted)
        callback(undefined, this.isMuted);
      })
      .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
        this.isMuted = value as boolean;
        this.log('HOMEKIT SET: isMuted', this.isMuted)
        this.callParticleFunction('setMute', this.isMuted ? 'true': 'false', callback);
      });

    this.updateCharacteristicByParticleVariable(onCharacteristic, 'isMuted', _ => _.body.result, _ => this.isMuted = _ as boolean);
    this.bindParticleEventToCharacteristic(onCharacteristic, 'mute', _ => _.data === 'true');
  }

  getServices(): Service[] {
    return [
      this.informationService,
      this.switchService
    ];
  }
}