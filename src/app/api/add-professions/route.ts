import { NextRequest } from 'next/server'
import { query } from '@/lib/database'
import { newProfessions } from '@/data/new-professions'

// Simple response helper
function createResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * @swagger
 * /api/add-professions:
 *   post:
 *     summary: Add new professions to the database
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Professions added successfully
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    let addedCount = 0
    let skippedCount = 0
    
    for (const profession of newProfessions) {
      try {
        // Check if profession already exists
        const existing = await query(
          'SELECT id FROM professions WHERE name = $1',
          [profession.name]
        )
        
        if (existing.rows.length > 0) {
          skippedCount++
          continue
        }
        
        // Generate random position for galaxy visualization
        const angle = Math.random() * 2 * Math.PI
        const radius = 50 + Math.random() * 200
        const x_position = Math.cos(angle) * radius
        const y_position = Math.sin(angle) * radius
        
        // Insert the profession
        await query(`
          INSERT INTO professions (
            name, description, area, required_education, 
            salary_min, salary_max, formation_time, main_activities,
            certifications, related_professions, icon_color,
            x_position, y_position
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          profession.name,
          profession.description,
          profession.area,
          profession.required_education,
          profession.salary_min,
          profession.salary_max,
          profession.formation_time,
          profession.main_activities,
          profession.certifications,
          profession.related_professions,
          profession.icon_color,
          x_position,
          y_position
        ])
        
        addedCount++
        
      } catch (error) {
        console.error(`Error adding profession ${profession.name}:`, error)
        skippedCount++
      }
    }
    
    return createResponse({
      success: true,
      message: `Profissões adicionadas: ${addedCount}, ignoradas: ${skippedCount}`,
      added: addedCount,
      skipped: skippedCount,
      total: newProfessions.length
    })
    
  } catch (error) {
    console.error('Error adding professions:', error)
    return createResponse({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, 500)
  }
}