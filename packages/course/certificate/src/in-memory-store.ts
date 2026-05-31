import type { Certificate, CertificateStore } from './types.js';

/** 記憶體版 CertificateStore。 */
export class InMemoryCertificateStore implements CertificateStore {
  private readonly data = new Map<string, Certificate>();

  async get(id: string): Promise<Certificate | undefined> {
    return this.data.get(id);
  }
  async getByVerificationCode(code: string): Promise<Certificate | undefined> {
    return Array.from(this.data.values()).find((c) => c.verificationCode === code);
  }
  async findByUserAndCourse(
    tenantId: string,
    userId: string,
    courseId: string,
  ): Promise<Certificate | undefined> {
    return Array.from(this.data.values()).find(
      (c) => c.tenantId === tenantId && c.userId === userId && c.courseId === courseId,
    );
  }
  async upsert(c: Certificate): Promise<void> {
    this.data.set(c.id, c);
  }
  async list(tenantId: string, userId: string): Promise<Certificate[]> {
    return Array.from(this.data.values()).filter(
      (c) => c.tenantId === tenantId && c.userId === userId,
    );
  }
}
