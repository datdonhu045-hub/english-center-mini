import { USE_MOCK_API } from '@/services/api/apiConfig';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { httpClient } from '@/services/api/httpClient';
import { mockDelay } from '@/services/api/mockUtils';
import {
  buildMockPortalDataset,
  saveStoredSubmission,
  saveStoredSupportRequest,
} from '../mocks/studentPortalMockData';
import { calculateReferenceDemoTotal } from '../model/studentPortal.schema';
import type {
  AssignmentSubmission,
  CreateSupportRequestInput,
  StudentPortalDataset,
  SubmitDemoScoreInput,
  SubmitHomeworkInput,
  SupportRequestRecord,
} from '../model/studentPortal.types';

export interface StudentPortalRepository {
  getPortalDataset(
    studentId: string,
    fallbackUser?: { fullName?: string; email?: string; phone?: string }
  ): Promise<StudentPortalDataset>;

  submitHomework(
    studentId: string,
    input: SubmitHomeworkInput
  ): Promise<AssignmentSubmission>;

  submitDemoScore(
    studentId: string,
    input: SubmitDemoScoreInput
  ): Promise<AssignmentSubmission>;

  createSupportRequest(
    studentId: string,
    input: CreateSupportRequestInput
  ): Promise<SupportRequestRecord>;
}

const mockStudentPortalRepository: StudentPortalRepository = {
  async getPortalDataset(studentId, fallbackUser) {
    await mockDelay(180);
    return buildMockPortalDataset(studentId, fallbackUser);
  },

  async submitHomework(studentId, input) {
    await mockDelay(250);
    const dataset = buildMockPortalDataset(studentId);
    const submission: AssignmentSubmission = {
      assignmentId: input.assignmentId,
      studentId,
      status: 'submitted',
      driveLink: input.driveLink.trim(),
      partScores: {
        lc: input.lcCorrect,
        rc: input.rcCorrect,
      },
      isConfirmedByTeacher: false,
      submittedAt: new Date().toISOString(),
    };

    const now = new Date();
    const todayObj = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    saveStoredSubmission(studentId, submission, dataset.assignments, todayObj);
    return submission;
  },

  async submitDemoScore(studentId, input) {
    await mockDelay(250);
    const dataset = buildMockPortalDataset(studentId);
    const scores = calculateReferenceDemoTotal(input.lcScore, input.rcScore);
    const submission: AssignmentSubmission = {
      assignmentId: input.assignmentId,
      studentId,
      status: 'submitted',
      demoScores: scores,
      isConfirmedByTeacher: false,
      submittedAt: new Date().toISOString(),
    };

    const now = new Date();
    const todayObj = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    saveStoredSubmission(studentId, submission, dataset.assignments, todayObj);
    return submission;
  },

  async createSupportRequest(studentId, input) {
    await mockDelay(250);
    const now = new Date();
    const record: SupportRequestRecord = {
      id: `req-${Date.now()}`,
      studentId,
      type: input.type,
      reason: input.reason,
      content: input.content.trim(),
      contact: input.contact?.trim() || undefined,
      createdAt: now.toLocaleDateString('vi-VN'),
      status: 'pending',
    };
    saveStoredSupportRequest(studentId, record);
    return record;
  },
};

const apiStudentPortalRepository: StudentPortalRepository = {
  async getPortalDataset() {
    return httpClient.get<StudentPortalDataset>(API_ENDPOINTS.studentPortal.profileMe);
  },

  async submitHomework(_studentId, input) {
    return httpClient.post<AssignmentSubmission>(
      API_ENDPOINTS.studentPortal.submitAssignment(input.assignmentId),
      {
        submissionType: 'homework',
        driveLink: input.driveLink.trim(),
        partScores: {
          lc: input.lcCorrect,
          rc: input.rcCorrect,
        },
      }
    );
  },

  async submitDemoScore(_studentId, input) {
    return httpClient.post<AssignmentSubmission>(
      API_ENDPOINTS.studentPortal.submitAssignment(input.assignmentId),
      {
        submissionType: 'demo',
        demoScores: calculateReferenceDemoTotal(input.lcScore, input.rcScore),
      }
    );
  },

  async createSupportRequest(_studentId, input) {
    return httpClient.post<SupportRequestRecord>(
      API_ENDPOINTS.studentPortal.createSupportRequest,
      input
    );
  },
};

export const studentPortalRepository: StudentPortalRepository = USE_MOCK_API
  ? mockStudentPortalRepository
  : apiStudentPortalRepository;
