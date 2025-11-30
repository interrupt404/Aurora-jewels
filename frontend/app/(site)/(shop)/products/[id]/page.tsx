// app/(site)/(shop)/products/[id]/page.tsx
import React from "react";
interface Props { params: { id: string } }

export default function ProductPage({ params }: Props) {
  return <main><h1>Product {params.id}</h1></main>;
}
