import axios from 'axios';
import { config } from '../../../config';
import {
  EmployeeInvitationInfo,
  SubmissionSuccess,
  CombinedFormPayload,
} from '../types/employee.types';

const http = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const employeeApi = {
  async getInvitationForm(token: string): Promise<EmployeeInvitationInfo> {
    const { data } = await http.get<EmployeeInvitationInfo>(
      `/employee/form/${token}`
    );
    return data;
  },

  async submitEmployeeForm(
    token: string,
    payload: CombinedFormPayload
  ): Promise<SubmissionSuccess> {
    const { data } = await http.post<SubmissionSuccess>(
      `/employee/form/${token}`,
      payload
    );
    return data;
  },

  async lookupByMobile(mobile: string): Promise<any | null> {
    try {
      const { data } = await http.get('/employee/lookup', {
        params: { mobile },
      });
      return data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  async registerEmployee(
    payload: CombinedFormPayload
  ): Promise<SubmissionSuccess> {
    const { data } = await http.post<SubmissionSuccess>(
      '/employee/register',
      payload
    );
    return data;
  },
};
