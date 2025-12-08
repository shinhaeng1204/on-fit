'use client'

import { MapPinIcon } from 'lucide-react'
import { Modal, ModalHeader, ModalContent, ModalFooter } from '@/components/common/Modal'
import { useState } from 'react'
import LocationViewer from '@/components/location/LocationViewer'

type Props = {
  open: boolean
  onClose: () => void
  onSelect?: (label: string, lat: number, lng: number) => void
}

export default function LocationModal({ open, onClose, onSelect }: Props) {
  


  return (
    <Modal open={open} onClose={onClose} size="xl" closeOnBackdrop className='max-h-xl'>
      <ModalHeader className="flex flex-row items-center gap-2 space-y-0">
        <MapPinIcon className="w-5 h-5" />
        <h3 className="text-base leading-none">동네 설정</h3>
      </ModalHeader>

      <ModalContent>
        <LocationViewer
          onPick={({lat, lng, region}) => {
            onSelect?.(region, lat, lng)
          }}
          
        />
      </ModalContent>

      <ModalFooter>
        {/* 별도 버튼 없이 LocationPicker 안에서 선택 완료 */}
      </ModalFooter>
    </Modal>
  )
}
