import NodeGeocoder from 'node-geocoder';

const options: NodeGeocoder.Options = {
  provider: 'openstreetmap',
  formatter: null,
};

export const geocoder = NodeGeocoder(options);
