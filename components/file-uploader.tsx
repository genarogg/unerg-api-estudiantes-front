"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ColumnMapper } from "@/components/column-mapper"
import { DataPreview } from "@/components/data-preview"
import { parseCSV, parseXLSX } from "@/lib/file-parsers"

// Estructura esperada para los datos
export type ExpectedStructure = {
  cedula: string
  primerNombre: string
  segundoNombre?: string
  primerApellido: string
  segundoApellido?: string
  genero?: string
  promocion?: string
  status?: string
  sede?: string
  condicion?: string
  fechaEgreso?: string
  carrera?: string
}

// Estructura para las columnas mapeadas
export type MappedColumns = {
  [key in keyof ExpectedStructure]?: string
}

export function FileUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [fileData, setFileData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mappedColumns, setMappedColumns] = useState<MappedColumns>({})
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"upload" | "map" | "preview">("upload")
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const selectedFile = e.target.files?.[0]

    if (!selectedFile) return

    if (![".csv", ".xlsx", ".xls"].some((ext) => selectedFile.name.toLowerCase().endsWith(ext))) {
      setError("El archivo seleccionado no es válido. Por favor, selecciona un archivo CSV o Excel (XLSX/XLS)")
      return
    }

    setFile(selectedFile)
    setIsLoading(true)

    try {
      let data: any[] = []
      let fileHeaders: string[] = []

      if (selectedFile.name.toLowerCase().endsWith(".csv")) {
        const result = await parseCSV(selectedFile)
        data = result.data
        fileHeaders = result.headers
      } else {
        const result = await parseXLSX(selectedFile)
        data = result.data
        fileHeaders = result.headers
      }

      setFileData(data)
      setHeaders(fileHeaders)

      // Intenta hacer un mapeo automático basado en nombres de columnas similares
      const initialMapping: MappedColumns = {}
      const expectedFields: (keyof ExpectedStructure)[] = [
        "cedula",
        "primerNombre",
        "segundoNombre",
        "primerApellido",
        "segundoApellido",
        "genero",
        "promocion",
        "status",
        "sede",
        "condicion",
        "fechaEgreso",
        "carrera",
      ]

      expectedFields.forEach((field) => {
        // Buscar coincidencias exactas primero
        const exactMatch = fileHeaders.find(
          (h) => h.toLowerCase() === field.toLowerCase() || h.toLowerCase().includes(field.toLowerCase()),
        )

        if (exactMatch) {
          initialMapping[field] = exactMatch
        }
      })

      setMappedColumns(initialMapping)
      setStep("map")
    } catch (err) {
      console.error(err)
      setError("Error al procesar el archivo. Verifica que el formato sea correcto.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMapColumns = (mapping: MappedColumns) => {
    setMappedColumns(mapping)
  }

  const handleProceed = () => {
    setStep("preview")
  }

  const handleReset = () => {
    setFile(null)
    setFileData([])
    setHeaders([])
    setMappedColumns({})
    setError(null)
    setStep("upload")
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === "upload" && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Cargar archivo CSV o Excel</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Arrastra y suelta tu archivo aquí o haz clic para seleccionarlo
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => document.getElementById("file-upload")?.click()}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <Upload className="h-4 w-4" />
                Seleccionar archivo
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Formatos soportados: CSV, XLSX, XLS. El sistema adaptará automáticamente las columnas.
            </p>
          </div>
        </div>
      )}

      {step === "map" && headers.length > 0 && (
        <ColumnMapper
          headers={headers}
          initialMapping={mappedColumns}
          onMap={handleMapColumns}
          onProceed={handleProceed}
          onReset={handleReset}
        />
      )}

      {step === "preview" && <DataPreview data={fileData} mapping={mappedColumns} onReset={handleReset} />}
    </div>
  )
}

