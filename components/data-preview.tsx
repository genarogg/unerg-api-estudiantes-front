"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { MappedColumns, ExpectedStructure } from "@/components/file-uploader"
import { Download, RotateCcw, Upload } from "lucide-react"
import { toast } from "react-toastify"

import { URL_BACKEND } from "@/env"

interface DataPreviewProps {
  data: any[]
  mapping: MappedColumns
  onReset: () => void
}

export function DataPreview({ data, mapping, onReset }: DataPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  const itemsPerPage = 10

  // Transformar los datos según el mapeo
  const transformedData: ExpectedStructure[] = data.map((row) => {
    const transformedRow: any = {}
    Object.keys(mapping).forEach((field) => {
      transformedRow[field] = ""
    })
    Object.entries(mapping).forEach(([targetField, sourceField]) => {
      if (sourceField && sourceField.trim() !== "" && row[sourceField] !== undefined) {
        transformedRow[targetField] = row[sourceField]
      }
    })
    return transformedRow
  })

  // Calcular paginación
  const totalPages = Math.ceil(transformedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = transformedData.slice(startIndex, startIndex + itemsPerPage)

  // Función para generar el rango de páginas
  const getPageRange = () => {
    const range = []
    const rangeSize = 7
    let start = Math.max(1, currentPage - Math.floor(rangeSize / 2))
    const end = Math.min(totalPages, start + rangeSize - 1)
    if (end === totalPages) {
      start = Math.max(1, end - rangeSize + 1)
    }
    for (let i = start; i <= end; i++) {
      range.push(i)
    }
    return range
  }

  // Generar CSV para descargar
  const handleDownload = () => {
    try {
      const fields = Object.keys(mapping).filter((key) => mapping[key as keyof MappedColumns])
      const headers = fields.map((field) => field)
      const rows = transformedData.map((row) => {
        return fields.map((field) => {
          const value = row[field as keyof ExpectedStructure]
          return value !== undefined ? value : ""
        })
      })
      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", "datos_mapeados.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Archivo CSV descargado correctamente")
    } catch (error) {
      toast.error("Error al descargar el archivo CSV")
    }
  }

  // Función para enviar al backend
  const handleUpload = async () => {
    try {
      setIsUploading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        toast.error("No se encontró el token de autenticación")
        return
      }

      const fields = Object.keys(mapping).filter((key) => mapping[key as keyof MappedColumns])
      const headers = fields.map((field) => field)
      const rows = transformedData.map((row) => {
        return fields.map((field) => {
          const value = row[field as keyof ExpectedStructure]
          return value !== undefined ? value : ""
        })
      })
      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
      const file = new File([csvContent], "datos_procesados.csv", { type: "text/csv" })

      const formData = new FormData()
      formData.append(
        "operations",
        JSON.stringify({
          query: `
          mutation($token: String!, $file: Upload!) {
            cargarArchivo(token: $token, file: $file) {
              type
              message
            }
          }
        `,
          variables: {
            token,
            file: null,
          },
        }),
      )
// 
      formData.append("map", JSON.stringify({ "0": ["variables.file"] }))
      formData.append("0", file)

      const response = await fetch(URL_BACKEND + "/graphql", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.errors) {
        throw new Error(result.errors[0].message)
      }

      toast.success("Archivo cargado correctamente")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cargar el archivo")
    } finally {
      setIsUploading(false)
    }
  }

  // Renderizar vista móvil
  const renderMobileView = () => (
    <div className="space-y-4">
      {paginatedData.map((row, index) => (
        <Card key={index} className="w-full">
          <CardContent className="p-4">
            {Object.entries(mapping)
              .filter(([_, sourceField]) => sourceField)
              .map(([targetField]) => (
                <div key={targetField} className="flex justify-between py-2 border-b last:border-0">
                  <span className="font-medium text-sm text-muted-foreground">{targetField}:</span>
                  <span className="text-sm">{row[targetField as keyof ExpectedStructure] || ""}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Renderizar vista desktop
  const renderDesktopView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Object.entries(mapping)
              .filter(([_, sourceField]) => sourceField)
              .map(([targetField]) => (
                <TableHead key={targetField}>{targetField}</TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((row, index) => (
              <TableRow key={index}>
                {Object.entries(mapping)
                  .filter(([_, sourceField]) => sourceField)
                  .map(([targetField]) => (
                    <TableCell key={targetField}>{row[targetField as keyof ExpectedStructure] || ""}</TableCell>
                  ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={Object.keys(mapping).length} className="text-center py-4">
                No hay datos para mostrar
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Vista Previa de Datos</CardTitle>
        <CardDescription>
          Estos son los datos mapeados según la configuración que has establecido. Puedes descargar el archivo procesado
          o enviarlo directamente al sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="hidden md:block">{renderDesktopView()}</div>
        <div className="block md:hidden">{renderMobileView()}</div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-1 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 h-8"
            >
              {"<<"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2 h-8"
            >
              {"<"}
            </Button>

            {getPageRange().map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="min-w-[32px] h-8"
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-2 h-8"
            >
              {">"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 h-8"
            >
              {">>"}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Volver a cargar
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Descargar CSV
          </Button>
          <Button onClick={handleUpload} disabled={isUploading}>
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Enviando..." : "Enviar al Sistema"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

