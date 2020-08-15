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
    const onCharacteristic = this.switchService.getCharacteristic(hap.Characteristic.On);
    onCharacteristic
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        this.log('HOMEKIT GET: isRTOActive', this.isRTOActive)
        callback(undefined, this.isRTOActive);
      })
      .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
        this.isRTOActive = value as boolean;
        this.log('HOMEKIT SET: isRTOActive', this.isRTOActive)
        this.callParticleFunction('setRTO', this.isRTOActive ? 'true': 'false', callback);
      });

    this.updateCharacteristicByParticleVariable(onCharacteristic, 'isRTOActive', _ => _.body.result, _ => this.isRTOActive = _ as boolean);
  }

  getServices(): Service[] {
    return [
      this.informationService,
      this.switchService
    ];
  }