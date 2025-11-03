import { apiClient } from './api-client';
import { getStoredAuth } from './auth';

export interface Report {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  image_url: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  admin_comment?: string;
  timestamp: Date;
}

// Real report functions connected to FastAPI backend
export const getAllReports = async (): Promise<Report[]> => {
  try {
    const auth = getStoredAuth();
    if (!auth) throw new Error('Not authenticated');

    const reports = await apiClient.getAllReports(auth.token);
    return reports.map((report: any) => ({
      id: report._id,
      user_id: report.user_id,
      user_name: report.user_name || 'Unknown User',
      user_email: report.user_email || 'unknown@example.com',
      image_url: report.image_url,
      location: report.location,
      latitude: report.latitude,
      longitude: report.longitude,
      description: report.description,
      status: report.status,
      admin_comment: report.admin_comment,
      timestamp: new Date(report.timestamp),
    }));
  } catch (error: any) {
    console.error('Failed to fetch reports:', error);
    throw new Error(error.message || 'Failed to fetch reports');
  }
};

export const getUserReports = async (userId: string): Promise<Report[]> => {
  try {
    const auth = getStoredAuth();
    if (!auth) throw new Error('Not authenticated');

    const reports = await apiClient.getUserReports(auth.token, userId);
    return reports.map((report: any) => ({
      id: report._id,
      user_id: report.user_id,
      user_name: report.user_name || auth.user.name,
      user_email: report.user_email || auth.user.email,
      image_url: report.image_url,
      location: report.location,
      latitude: report.latitude,
      longitude: report.longitude,
      description: report.description,
      status: report.status,
      admin_comment: report.admin_comment,
      timestamp: new Date(report.timestamp),
    }));
  } catch (error: any) {
    console.error('Failed to fetch user reports:', error);
    throw new Error(error.message || 'Failed to fetch your reports');
  }
};

export const createReport = async (
  imageFile: File,
  location: string,
  description: string
): Promise<Report> => {
  try {
    const auth = getStoredAuth();
    if (!auth) throw new Error('Not authenticated');

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('location', location);
    formData.append('description', description);

    const report = await apiClient.createReport(auth.token, formData);
    
    return {
      id: report._id,
      user_id: report.user_id,
      user_name: report.user_name,
      user_email: report.user_email,
      image_url: report.image_url,
      location: report.location,
      latitude: report.latitude,
      longitude: report.longitude,
      description: report.description,
      status: report.status,
      admin_comment: report.admin_comment,
      timestamp: new Date(report.timestamp),
    };
  } catch (error: any) {
    console.error('Failed to create report:', error);
    throw new Error(error.message || 'Failed to create report');
  }
};

export const updateReportStatus = async (
  reportId: string,
  status: 'pending' | 'in_progress' | 'completed',
  adminComment?: string
): Promise<Report> => {
  try {
    const auth = getStoredAuth();
    if (!auth) throw new Error('Not authenticated');

    const report = await apiClient.updateReport(auth.token, reportId, status, adminComment);
    
    return {
      id: report._id,
      user_id: report.user_id,
      user_name: report.user_name,
      user_email: report.user_email,
      image_url: report.image_url,
      location: report.location,
      latitude: report.latitude,
      longitude: report.longitude,
      description: report.description,
      status: report.status,
      admin_comment: report.admin_comment,
      timestamp: new Date(report.timestamp),
    };
  } catch (error: any) {
    console.error('Failed to update report:', error);
    throw new Error(error.message || 'Failed to update report');
  }
};

export const getReportStats = async () => {
  try {
    const auth = getStoredAuth();
    if (!auth) throw new Error('Not authenticated');

    const stats = await apiClient.getReportStats(auth.token);
    return {
      pending: stats.pending,
      inProgress: stats.in_progress,
      completed: stats.completed,
      total: stats.total,
    };
  } catch (error: any) {
    console.error('Failed to fetch report stats:', error);
    return {
      pending: 0,
      inProgress: 0,
      completed: 0,
      total: 0,
    };
  }
};