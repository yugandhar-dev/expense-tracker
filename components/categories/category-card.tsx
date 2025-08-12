'use client'

import { Category } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface CategoryCardProps {
  category: Category
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  canEdit: boolean
}

export function CategoryCard({ category, onDelete, onEdit, canEdit }: CategoryCardProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      setDeleting(true)
      try {
        await onDelete(category.id)
      } finally {
        setDeleting(false)
      }
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0" 
              style={{ backgroundColor: category.color }}
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-foreground truncate">
                {category.name}
              </h3>
            </div>
          </div>

          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(category.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive"
                  disabled={deleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {category.is_default && (
              <Badge variant="secondary" className="text-xs">
                Default
              </Badge>
            )}
          </div>
          
          <div 
            className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700" 
            style={{ backgroundColor: category.color }}
            title={`Color: ${category.color}`}
          />
        </div>
      </CardContent>
    </Card>
  )
}