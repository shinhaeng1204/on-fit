"use client"

import { useState } from "react"
import DropBox from "@/components/common/DropBox"
import { SIDO_OPTIONS, getSigunguOptions } from "@/constants/korea-regions"

export default function LocationSelector() {
  const [sido, setSido] = useState("전체")
  const [sigungu, setSigungu] = useState("전체")

  const updateHiddenInput = (nextSido:string, nextSigungu:string) => {
    const hidden = document.getElementById("location-input") as HTMLInputElement
    
    if (!hidden) return

    if (nextSido === "전체") hidden.value = ""
    else if (nextSigungu === "전체") hidden.value = nextSido
    else hidden.value = `${nextSido} ${nextSigungu}`
  }

  return (
    <div className="grid grid-cols-2 gap-3">

      {/* 시/도 */}
      <DropBox
        value={sido}
        options={["전체", ...SIDO_OPTIONS]}
        onChange={(v) => {
          setSido(v)
          setSigungu("전체")
          updateHiddenInput(v, "전체")
        }}
      />

      {/* 시군구 */}
      <DropBox
        value={sigungu}
        options={
          sido === "전체"
            ? ["전체"]
            : ["전체", ...getSigunguOptions(sido)]
        }
        onChange={(v) => {
          setSigungu(v)
          updateHiddenInput(sido, v)
        }}
      />
    </div>
  )
}