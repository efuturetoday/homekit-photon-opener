import {
  CharacteristicGetCallback,
  HAP,
  Logging,
  Service,
  CharacteristicEventTypes,
  CharacteristicChange
} from 'homebridge';
import { AbstractAccessory } from './abstract-accessory';

export class DoorOpenerSwitch extends AbstractAccessory {

  private readonly switchService: Service;

  constructor(hap: HAP, log: Logging, name: string, particle: any, config: any) {
    super(hap, log, name, particle, config);

    this.switchService = new hap.Service.Switch(name);
    const onCharacteristic = this.switchService.getCharacteristic(hap.Characteristic.On);
    onCharacteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
      this.log('HOMEKIT GET: DoorOpenerSwitch', onCharacteristic.value)
      callback(undefined, onCharacteristic.value);
    });

    this.bindParticleFunctionToCharacteristic(onCharacteristic, 'open', _ => '')
      .on(CharacteristicEventTypes.CHANGE, (change: CharacteristicChange) => {
        this.log.debug('', change);
        if (change.newValue) {
          onCharacteristic.updateValue(false);
        }
      });

  }

  getServices(): Service[] {
    return [
      this.informationService,
      this.switchService
    ];
  }
}