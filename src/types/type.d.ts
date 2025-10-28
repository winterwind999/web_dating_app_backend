type User = {
  photo: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  password: string;
  birthday: Date;
  gender: Gender;
  shortBio: string;
  address: Address;
  interests: string[];
  preferences: Preferences;
  albums: Album[];
  status;
};

type Gender = 'MALE' | 'FEMALE' | 'NON_BINARY' | 'OTHER';

type Status = 'ACTIVE' | 'PAUSED' | 'BANNED' | 'DELETED';

type Address = {
  street: string;
  city: string;
  province: string;
  country: string;
  coordinates: number[];
};

type Preferences = {
  genderPreference: Gender[];
  minAge: number;
  maxAge: number;
  maxDistance: number;
};

type Status = 'ACTIVE' | 'PAUSED' | 'BANNED' | 'DELETED';

type Album = {
  id: string;
  src: string;
  type: AlbumType;
  sortOrder: number;
};

type AlbumType = 'IMAGE' | 'VIDEO';
