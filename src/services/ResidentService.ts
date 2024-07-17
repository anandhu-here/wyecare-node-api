// src/services/ResidentService.ts

import Resident, { IResident } from "../models/Resident";

class ResidentService {
  public async createResident(
    residentData: Partial<IResident>
  ): Promise<IResident> {
    try {
      const resident = new Resident(residentData);
      await resident.save();
      return resident;
    } catch (error: any) {
      throw new Error(`Failed to create resident: ${error.message}`);
    }
  }

  public async updateResident(
    residentId: string,
    updateData: Partial<IResident>
  ): Promise<IResident | null> {
    try {
      const updatedResident = await Resident.findByIdAndUpdate(
        residentId,
        updateData,
        { new: true, runValidators: true }
      );
      if (!updatedResident) {
        throw new Error("Resident not found");
      }
      return updatedResident;
    } catch (error: any) {
      throw new Error(`Failed to update resident: ${error.message}`);
    }
  }

  public async getResident(residentId: string): Promise<IResident | null> {
    try {
      const resident = await Resident.findById(residentId);
      if (!resident) {
        throw new Error("Resident not found");
      }
      return resident;
    } catch (error: any) {
      throw new Error(`Failed to get resident: ${error.message}`);
    }
  }

  public async getResidents(homeId: string): Promise<IResident[]> {
    try {
      console.log(homeId, "hhhh");
      return await Resident.find({ homeId });
    } catch (error: any) {
      console.log(error, "eror");
      throw new Error(`Failed to get residents: ${error.message}`);
    }
  }
}

export default ResidentService;
