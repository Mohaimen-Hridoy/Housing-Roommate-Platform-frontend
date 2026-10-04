"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailsPanel } from "@/components/dashboard/owner/details-panel";
import { PhotosPanel } from "@/components/dashboard/owner/photos-panel";
import { RoomsPanel } from "@/components/dashboard/owner/rooms-panel";
import type { Amenity, ImageAsset, PropertyDetail, Room } from "@/lib/types/api";

interface PropertyManagerProps {
  property: PropertyDetail;
  /** All rooms, including occupied and reserved ones (the detail endpoint only returns available rooms). */
  rooms: Room[];
  images: ImageAsset[];
  allAmenities: Amenity[];
}

/** Tabbed management screen for a single property. */
export function PropertyManager({ property, rooms: initialRooms, images: initialImages, allAmenities }: PropertyManagerProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [images, setImages] = useState<ImageAsset[]>(initialImages);

  return (
    <Tabs defaultValue="rooms" className="space-y-2">
      <TabsList>
        <TabsTrigger value="rooms">
          Rooms
          <Badge variant="secondary" className="ml-1">
            {rooms.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="photos">
          Photos
          <Badge variant="secondary" className="ml-1">
            {images.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>

      <TabsContent value="rooms">
        <RoomsPanel propertyId={property.id} rooms={rooms} onRoomsChange={setRooms} />
      </TabsContent>

      <TabsContent value="photos">
        <PhotosPanel propertyId={property.id} images={images} onImagesChange={setImages} />
      </TabsContent>

      <TabsContent value="details">
        <DetailsPanel property={property} allAmenities={allAmenities} />
      </TabsContent>
    </Tabs>
  );
}