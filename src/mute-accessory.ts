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
    this.switchService.getCharacteristic(hap.Characteristic.On)
      .on(CharacteristicEventTypes.GET, this.handleSwitchGet.bind(this))
      .on(CharacteristicEventTypes.SET, this.handleSwitchSet.bind(this));

    this.bindParticleEvent('mute', this.handleParticleEvent.bind(this));
    this.pollParticleVariable();
  }


  handleSwitchGet(callback: CharacteristicGetCallback) {
    this.log.debug('HOMEKIT GET: isMuted', this.isMuted)
    callback(undefined, this.isMuted);
  }

  handleSwitchSet(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.log.debug('HOMEKIT SET: isMuted', value);

    this.isMuted = value as boolean;
    this.callParticleFunction('setMute', this.isMuted.toString())
      .then(() => {
        callback(undefined, this.isMuted);
      })
      .catch((err) => {
        callback(err);
      });
  }

  handleParticleEvent(event: any) {
    this.isMuted = event.data === 'true';
    this.switchService.updateCharacteristic(this.hap.Characteristic.On, this.isMuted);
  }

  pollParticleVariable() {
    this.getParticleVariable('isMuted')
      .then((response: any) => {
        this.isMuted = response.body.result;
        this.switchService.updateCharacteristic(this.hap.Characteristic.On, this.isMuted);
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
