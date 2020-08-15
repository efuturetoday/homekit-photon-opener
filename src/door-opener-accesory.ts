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

  private isDoorOpenerActive: boolean = false

  private readonly switchService: Service;

  constructor(hap: HAP, log: Logging, name: string, particle: any, config: any) {
    super(hap, log, name, particle, config);

    this.switchService = new hap.Service.Switch(name);
    const onCharacteristic = this.switchService.getCharacteristic(hap.Characteristic.On);
    onCharacteristic
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        this.log('HOMEKIT GET: isDoorOpenerActive', this.isDoorOpenerActive)
        callback(undefined, this.isDoorOpenerActive);
      })
      .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
        this.isDoorOpenerActive = value as boolean;
        this.log('HOMEKIT SET: isDoorOpenerActive', this.isDoorOpenerActive)
        
        if (this.isDoorOpenerActive) {
          this.callParticleFunction('open', '', (err) => {
            setTimeout(() => {
              this.switchService.setCharacteristic(hap.Characteristic.On, false);
            }, 500);
            callback(err, this.isDoorOpenerActive);
          });
         
        } else {
          callback(undefined, this.isDoorOpenerActive);
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