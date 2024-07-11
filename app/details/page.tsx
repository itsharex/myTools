"use client"

import { useRouter, useSearchParams } from "next/navigation";
import ToolsDetail from "@/components/tools-detail";

export default function DetailPage() {
 
  const params = useSearchParams()
  const toolId = params.get("toolId");
  return (
    <ToolsDetail toolsId={toolId??""}/>
  )
}
