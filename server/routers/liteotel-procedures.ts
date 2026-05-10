/**
 * liteAPI Hotel Procedures for tRPC Router
 * Add these procedures to the hotelsRouter
 */

import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const liteAPIHotelProcedures = {
  searchPlaces: publicProcedure.input(z.object({
    query: z.string().min(1),
  })).query(async ({ input }) => {
    try {
      const { searchPlaces } = await import("../liteapi");
      const result = await searchPlaces(input.query);
      return result;
    } catch (error) {
      console.error("Error searching places:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to search places" });
    }
  }),

  searchLiteAPI: publicProcedure.input(z.object({
    checkIn: z.string(),
    checkOut: z.string(),
    occupancies: z.array(z.object({
      paxes: z.array(z.object({ age: z.number() })),
    })),
    currency: z.string().optional().default("SAR"),
    guestNationality: z.string().optional().default("SA"),
    cityName: z.string().optional(),
    countryCode: z.string().optional(),
    hotelIds: z.array(z.string()).optional(),
  })).query(async ({ input }) => {
    try {
      const { searchHotels } = await import("../liteapi");
      const result = await searchHotels({
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        occupancies: input.occupancies,
        currency: input.currency,
        guestNationality: input.guestNationality,
        cityName: input.cityName,
        countryCode: input.countryCode,
        hotelIds: input.hotelIds,
        includeHotelData: true,
      });
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[searchLiteAPI Error]", errorMsg, error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Failed to search hotels: ${errorMsg}` });
    }
  }),

  getDetails: publicProcedure.input(z.object({
    hotelId: z.string(),
  })).query(async ({ input }) => {
    try {
      const { getHotelDetails } = await import("../liteapi");
      const result = await getHotelDetails(input.hotelId);
      return result;
    } catch (error) {
      console.error("Error getting hotel details:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get hotel details" });
    }
  }),

  getReviews: publicProcedure.input(z.object({
    hotelId: z.string(),
  })).query(async ({ input }) => {
    try {
      const { getHotelReviews } = await import("../liteapi");
      const result = await getHotelReviews(input.hotelId);
      return result;
    } catch (error) {
      console.error("Error getting hotel reviews:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get hotel reviews" });
    }
  }),

  prebook: protectedProcedure.input(z.object({
    checkIn: z.string(),
    checkOut: z.string(),
    occupancies: z.array(z.object({
      paxes: z.array(z.object({ age: z.number() })),
    })),
    hotelId: z.string(),
    rateId: z.string(),
    roomId: z.string(),
    currency: z.string().optional().default("SAR"),
    guestNationality: z.string().optional().default("SA"),
  })).mutation(async ({ input, ctx }) => {
    try {
      const { createPrebook } = await import("../liteapi");
      const result = await createPrebook({
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        occupancies: input.occupancies,
        hotelId: input.hotelId,
        rateId: input.rateId,
        roomId: input.roomId,
        currency: input.currency,
        guestNationality: input.guestNationality,
      });
      return result;
    } catch (error) {
      console.error("Error creating prebook:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create prebook" });
    }
  }),

  book: protectedProcedure.input(z.object({
    prebookId: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    country: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    try {
      const { confirmBooking } = await import("../liteapi");
      const result = await confirmBooking({
        prebookId: input.prebookId,
        guestFirstName: input.firstName,
        guestLastName: input.lastName,
        guestEmail: input.email,
        guestPhone: input.phone,
        guestCountry: input.country,
      });
      return result;
    } catch (error) {
      console.error("Error completing booking:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to complete booking" });
    }
  }),
};
