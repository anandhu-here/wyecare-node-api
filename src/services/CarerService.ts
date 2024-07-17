import admin from "firebase-admin";
import { UploadedFile } from "express-fileupload";
import CarerDoc from "../models/CarerDoc";
import CarerCertificate from "../models/CarerCertificate";
import { ICertificate, IDocument } from "src/interfaces/entities/carer";

class CarerDocumentService {
  private bucket: string;

  constructor() {
    this.bucket = process.env.BUCKET;
  }

  public async deleteFile(fileName: string): Promise<void> {
    if (admin.apps.length === 0) {
      throw new Error("Firebase Admin SDK not initialized");
    }

    try {
      const bucket = admin.storage().bucket(this.bucket);
      const file = bucket.file(fileName);
      await file.delete();
    } catch (error: any) {
      console.error("Error in deleteFile:", error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  public async uploadFile(
    file: UploadedFile,
    fileName: string
  ): Promise<string> {
    if (admin.apps.length === 0) {
      throw new Error("Firebase Admin SDK not initialized");
    }

    try {
      const bucket = admin.storage().bucket(this.bucket);
      const fileBuffer = Buffer.from(file.data);

      const fileUpload = bucket.file(fileName);
      await fileUpload.save(fileBuffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });

      await fileUpload.makePublic();

      return `https://firebasestorage.googleapis.com/v0/b/${
        this.bucket
      }/o/${encodeURIComponent(fileName)}?alt=media`;
    } catch (error: any) {
      console.error("Error in uploadFile:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  public async addDocument(
    carerId: string,
    file: UploadedFile,
    type: string
  ): Promise<IDocument> {
    try {
      const fileName = `documents/${carerId}_${file.name}`;
      const url = await this.uploadFile(file, fileName);

      const document: IDocument = {
        name: file.name,
        url,
        type,
        uploadDate: new Date(),
      };

      const updatedDoc = await CarerDoc.findOneAndUpdate(
        { carerId },
        { $push: { documents: document } },
        { upsert: true, new: true }
      );

      if (!updatedDoc) {
        throw new Error("Failed to update carer document");
      }

      return document;
    } catch (error: any) {
      console.error("Error in addDocument:", error);
      throw new Error(`Failed to add document: ${error.message}`);
    }
  }

  public async deleteDocument(
    carerId: string,
    documentId: string,
    fileName: string
  ): Promise<void> {
    try {
      console.log("deleteDocument", carerId, documentId);
      const carerDoc = await CarerDoc.findOne({ carerId });
      if (!carerDoc) {
        throw new Error("Carer not found");
      }

      console.log(carerDoc.documents, "carer docs");
      const document = carerDoc.documents.find(
        (doc: any) => doc._id.toString() === documentId
      );
      if (!document) {
        throw new Error("Document not found");
      }

      await this.deleteFile(`documents/${carerId}_${fileName}`);

      await CarerDoc.findOneAndUpdate(
        { carerId },
        { $pull: { documents: { _id: documentId } } }
      );
    } catch (error: any) {
      console.error("Error in deleteDocument:", error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  public async deleteCertificate(
    carerId: string,
    certificateId: string,
    fileName: string
  ): Promise<void> {
    try {
      const carerCertificate = await CarerCertificate.findOne({ carerId });
      if (!carerCertificate) {
        throw new Error("Carer not found");
      }

      const certificate = carerCertificate.certificates.find(
        (cert: any) => cert._id.toString() === certificateId
      );
      if (!certificate) {
        throw new Error("Certificate not found");
      }

      await this.deleteFile(`certificates/${carerId}_${fileName}`);

      await CarerCertificate.findOneAndUpdate(
        { carerId },
        { $pull: { certificates: { _id: certificateId } } }
      );
    } catch (error: any) {
      console.error("Error in deleteCertificate:", error);
      throw new Error(`Failed to delete certificate: ${error.message}`);
    }
  }

  public async addCertificate(
    carerId: string,
    file: UploadedFile,
    type: string
  ): Promise<ICertificate> {
    try {
      const fileName = `certificates/${carerId}_${file.name}`;
      const url = await this.uploadFile(file, fileName);

      const certificate: ICertificate = {
        name: file.name,
        url,
        type,
        uploadDate: new Date(),
      };

      const updatedCert = await CarerCertificate.findOneAndUpdate(
        { carerId },
        { $push: { certificates: certificate } },
        { upsert: true, new: true }
      );

      if (!updatedCert) {
        throw new Error("Failed to update carer certificate");
      }

      return certificate;
    } catch (error: any) {
      console.error("Error in addCertificate:", error);
      throw new Error(`Failed to add certificate: ${error.message}`);
    }
  }

  public async updateShareCode(
    carerId: string,
    shareCode: string
  ): Promise<void> {
    try {
      const result = await CarerDoc.findOneAndUpdate(
        { carerId },
        { shareCode },
        { new: true }
      );
      if (!result) {
        throw new Error("Carer not found");
      }
    } catch (error: any) {
      console.error("Error in updateShareCode:", error);
      throw new Error(`Failed to update share code: ${error.message}`);
    }
  }

  public async updateNiNumber(
    carerId: string,
    niNumber: string
  ): Promise<void> {
    try {
      const result = await CarerDoc.findOneAndUpdate(
        { carerId },
        { niNumber },
        { new: true }
      );
      if (!result) {
        throw new Error("Carer not found");
      }
    } catch (error: any) {
      console.error("Error in updateNiNumber:", error);
      throw new Error(`Failed to update NI number: ${error.message}`);
    }
  }

  public async getCarerDocuments(carerId: string): Promise<IDocument[]> {
    try {
      const carerDoc = await CarerDoc.findOne({ carerId });
      if (!carerDoc) {
        return [];
      }
      return carerDoc.documents || [];
    } catch (error: any) {
      console.error("Error in getCarerDocuments:", error);
      throw new Error(`Failed to get carer documents: ${error.message}`);
    }
  }

  public async getCarerCertificates(carerId: string): Promise<ICertificate[]> {
    try {
      const carerCertificate = await CarerCertificate.findOne({ carerId });
      if (!carerCertificate) {
        return [];
      }
      return carerCertificate.certificates || [];
    } catch (error: any) {
      console.error("Error in getCarerCertificates:", error);
      throw new Error(`Failed to get carer certificates: ${error.message}`);
    }
  }

  public async getCarerAdditionalInfo(
    carerId: string
  ): Promise<{ shareCode?: string; niNumber?: string }> {
    try {
      const carerDoc = await CarerDoc.findOne({ carerId });
      if (!carerDoc) {
        throw new Error("Carer not found");
      }
      return {
        shareCode: carerDoc.shareCode,
        niNumber: carerDoc.niNumber,
      };
    } catch (error: any) {
      console.error("Error in getCarerAdditionalInfo:", error);
      throw new Error(`Failed to get carer additional info: ${error.message}`);
    }
  }
}

export default CarerDocumentService;
