import api from './axios';
import type { PartyCreate, PartyUpdate, PartyRead } from '../../types/party.type';

export const getAllParties = async (): Promise<PartyRead[]> => {
  const response = await api.get<PartyRead[]>('/parties/');
  return response.data;
};

export const createParty = async (data: PartyCreate): Promise<PartyRead> => {
  const response = await api.post<PartyRead>('/parties/', data);
  return response.data;
};

export const getPartyById = async (id: string): Promise<PartyRead> => {
  const response = await api.get<PartyRead>(`/parties/${id}`);
  return response.data;
};

export const getPartyByNit = async (nit: string): Promise<PartyRead> => {
  const response = await api.get<PartyRead>(`/parties/nit/${nit}`);
  return response.data;
};

export const getPartiesByType = async (partyType: string): Promise<PartyRead[]> => {
  const response = await api.get<PartyRead[]>(`/parties/type/${partyType}`);
  return response.data;
};

export const searchPartiesByName = async (name: string): Promise<PartyRead[]> => {
  const response = await api.get<PartyRead[]>(`/parties/search-name/${name}`);
  return response.data;
};

export const updateParty = async (id: string, data: PartyUpdate): Promise<PartyRead> => {
  const response = await api.put<PartyRead>(`/parties/${id}`, data);
  return response.data;
};

export const deleteParty = async (id: string): Promise<void> => {
  await api.delete(`/parties/${id}`);
};