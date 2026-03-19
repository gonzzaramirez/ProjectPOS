"use client"

import { Toaster } from "sileo"

export function SileoToaster() {
  return (
    <Toaster
      position="top-center"
      options={{
        fill: "#09090b",
        roundness: 18,
        styles: {
          title: "!text-white !font-semibold",
          description: "!text-white",
        },
      }}
    />
  )
}
