export interface PartyCreate {
  name: string;
  nit?: string;
  address?: string;
  phone?: string;
  email?: string;
  party_type?: string;
}

export interface PartyUpdate {
  name?: string;
  nit?: string;
  address?: string;
  phone?: string;
  email?: string;
  party_type?: string;
}

export interface PartyRead {
  id: string;
  name: string;
  nit?: string;
  address?: string;
  phone?: string;
  email?: string;
  party_type?: string;
}