// Función para parsear archivos CSV
export async function parseCSV(file: File): Promise<{ headers: string[]; data: any[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string
        const lines = csvText.split(/\r\n|\n/)

        // Detectar el separador (puede ser , o ;)
        const firstLine = lines[0]
        const separator = firstLine.includes(";") ? ";" : ","

        // Extraer y procesar encabezados
        const rawHeaders = lines[0].split(separator).map((header) => header.trim().replace(/^"|"$/g, ""))

        // Expandir los encabezados que contengan múltiples campos
        const headers: string[] = rawHeaders.reduce((acc: string[], header) => {
          // Si el encabezado contiene múltiples campos (ej: "cedula;nombre")
          if (header.includes(";")) {
            const subFields = header.split(";").map((h) => h.trim())
            acc.push(...subFields)
          } else {
            acc.push(header)
          }
          return acc
        }, [])

        // Parsear datos
        const data = []
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue

          // Manejar valores entre comillas que pueden contener separadores
          const values: string[] = []
          let currentValue = ""
          let insideQuotes = false

          for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j]

            if (char === '"') {
              insideQuotes = !insideQuotes
            } else if ((char === "," || char === ";") && !insideQuotes) {
              values.push(currentValue.trim().replace(/^"|"$/g, ""))
              currentValue = ""
            } else {
              currentValue += char
            }
          }

          // Añadir el último valor
          values.push(currentValue.trim().replace(/^"|"$/g, ""))

          // Expandir los valores que correspondan a campos múltiples
          const expandedValues: string[] = []
          values.forEach((value, index) => {
            if (rawHeaders[index]?.includes(";")) {
              // Si el encabezado correspondiente tiene múltiples campos,
              // dividir el valor en consecuencia
              const subValues = value.split(";").map((v) => v.trim())
              expandedValues.push(...subValues)
            } else {
              expandedValues.push(value)
            }
          })

          // Crear objeto con los datos
          const rowData: Record<string, string> = {}
          headers.forEach((header, index) => {
            if (index < expandedValues.length) {
              rowData[header] = expandedValues[index]
            }
          })

          data.push(rowData)
        }

        resolve({ headers, data })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo"))
    }

    reader.readAsText(file)
  })
}

// Función para parsear archivos XLSX
export async function parseXLSX(file: File): Promise<{ headers: string[]; data: any[] }> {
  // Importar dinámicamente xlsx para que solo se cargue cuando sea necesario
  const XLSX = await import("xlsx")

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = event.target?.result
        const workbook = XLSX.read(data, { type: "array" })

        // Obtener la primera hoja
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        // Extraer y procesar encabezados (primera fila)
        const rawHeaders = jsonData[0] as string[]

        // Expandir los encabezados que contengan múltiples campos
        const headers: string[] = rawHeaders.reduce((acc: string[], header) => {
          if (typeof header === "string" && header.includes(";")) {
            const subFields = header.split(";").map((h) => h.trim())
            acc.push(...subFields)
          } else {
            acc.push(header)
          }
          return acc
        }, [])

        // Convertir datos a formato requerido
        const rows = []
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[]
          if (row.length === 0) continue

          // Expandir los valores que correspondan a campos múltiples
          const expandedValues: string[] = []
          row.forEach((value, index) => {
            if (typeof rawHeaders[index] === "string" && rawHeaders[index].includes(";")) {
              // Si el encabezado correspondiente tiene múltiples campos,
              // dividir el valor en consecuencia
              const stringValue = String(value)
              const subValues = stringValue.split(";").map((v) => v.trim())
              expandedValues.push(...subValues)
            } else {
              expandedValues.push(String(value))
            }
          })

          const rowData: Record<string, any> = {}
          headers.forEach((header, index) => {
            if (index < expandedValues.length) {
              rowData[header] = expandedValues[index]
            }
          })

          rows.push(rowData)
        }

        resolve({ headers, data: rows })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo"))
    }

    reader.readAsArrayBuffer(file)
  })
}

