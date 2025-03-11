"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { MappedColumns } from "@/components/file-uploader"
import { ArrowRight, RotateCcw, Loader2 } from "lucide-react"

interface ColumnMapperProps {
  headers: string[]
  initialMapping: MappedColumns
  onMap: (mapping: MappedColumns) => void
  onProceed: () => void
  onReset: () => void
}

// Definición de los campos requeridos y opcionales
const requiredFields: (keyof MappedColumns)[] = ["cedula", "primerNombre", "primerApellido"]
const optionalFields: (keyof MappedColumns)[] = [
  "segundoNombre",
  "segundoApellido",
  "genero",
  "promocion",
  "status",
  "sede",
  "condicion",
  "fechaEgreso",
  "carrera",
]

// Nombres amigables para mostrar en la interfaz
const fieldLabels: Record<string, string> = {
  cedula: "Cédula",
  primerNombre: "Primer Nombre",
  segundoNombre: "Segundo Nombre",
  primerApellido: "Primer Apellido",
  segundoApellido: "Segundo Apellido",
  genero: "Género",
  promocion: "Promoción",
  status: "Estado",
  sede: "Sede",
  condicion: "Condición",
  fechaEgreso: "Fecha de Egreso",
  carrera: "Carrera",
}

export function ColumnMapper({ headers, initialMapping, onMap, onProceed, onReset }: ColumnMapperProps) {
  const [mapping, setMapping] = useState<MappedColumns>(initialMapping)
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isContentVisible, setIsContentVisible] = useState(false)

  useEffect(() => {
    // Fase 1: Preparar los datos
    setMapping(initialMapping)
    setIsValid(Object.values(initialMapping).some((value) => value && value.trim() !== ""))

    // Fase 2: Mostrar el spinner
    const spinnerTimer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    // Fase 3: Mostrar el contenido
    const contentTimer = setTimeout(() => {
      setIsContentVisible(true)
    }, 600) // Ligeramente después de que el spinner desaparezca

    return () => {
      clearTimeout(spinnerTimer)
      clearTimeout(contentTimer)
    }
  }, [initialMapping])

  const handleSelectChange = (field: keyof MappedColumns, value: string) => {
    setMapping((prev) => ({
      ...prev,
      [field]: value === "unmapped" ? "" : value,
    }))
  }

  useEffect(() => {
    const atLeastOneFieldMapped = Object.values(mapping).some((value) => value && value.trim() !== "")
    setIsValid(atLeastOneFieldMapped)
  }, [mapping])

  const handleSubmit = () => {
    onMap(mapping)
    onProceed()
  }

  const renderContent = () => (
    <div className={`grid gap-6 transition-opacity duration-300 ${isContentVisible ? "opacity-100" : "opacity-0"}`}>
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Campos del Sistema</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...requiredFields, ...optionalFields].map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={`field-${field}`}>
                {fieldLabels[field]}
                {requiredFields.includes(field) && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Select value={mapping[field] || "unmapped"} onValueChange={(value) => handleSelectChange(field, value)}>
                <SelectTrigger id={`field-${field}`}>
                  <SelectValue placeholder="Seleccionar columna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unmapped">No mapear</SelectItem>
                  {headers.map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mapeo de Columnas</CardTitle>
        <CardDescription>
          Selecciona qué columna de tu archivo corresponde a cada campo del sistema. Los campos que no existan en tu
          archivo pueden dejarse sin mapear y quedarán vacíos.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Preparando campos...</p>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reiniciar
        </Button>
        <Button onClick={handleSubmit} disabled={!isValid}>
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

