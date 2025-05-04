"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import type { Label, Project } from "../lib/types"
import { Check, ChevronsUpDown, Loader2, Tag } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useAuth } from "../context/AuthContext"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { useNavigate } from "react-router-dom"
import { useMobile } from "../hooks/use-mobile"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./ui/command"
import { cn } from "../lib/utils"

interface LabelDialogProps {
  label?: Label
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function LabelDialog({ label, isOpen, onClose, onSuccess }: LabelDialogProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [formData, setFormData] = useState({
    name: label?.name || "",
    description: label?.description || "",
    project_id: label?.project_id || "",
    label_json: label?.label_json || {},
    status: label?.status || "draft",
  })
  const isMobile = useMobile()

  const isEditing = Boolean(label)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchProjects()
    if (label) {
      setFormData({
        name: label.name,
        description: label.description || "",
        project_id: label.project_id,
        label_json: label.label_json as object,
        status: label.status,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        project_id: "",
        label_json: {},
        status: "draft",
      })
    }
  }, [label])

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user?.id)
        .is("deleted_at", null)

      if (error) throw error
      setProjects(data || [])
    } catch {
      toast.error("Error fetching projects")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditing) {
        const { error } = await supabase
          .from("labels")
          .update({
            name: formData.name,
            description: formData.description,
            project_id: formData.project_id,
            label_json: formData.label_json,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", label?.id)

        if (error) throw error
        toast.success("Label updated", {
          description: `"${formData.name}" has been updated successfully.`,
          icon: true,
        })
        onSuccess()
        onClose()
      } else {
        // Creating new label
        const { data, error } = await supabase
          .from("labels")
          .insert([
            {
              name: formData.name,
              description: formData.description,
              project_id: formData.project_id,
              label_json: formData.label_json,
              status: formData.status,
              owner_id: user?.id,
            },
          ])
          .select()
          .single()

        if (error) throw error
        toast.success("Label created", {
          description: `"${formData.name}" has been created successfully.`,
          icon: true,
        })

        // Redirect to editor instead of closing
        navigate(`/editor/${data.id}`)
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error(`Error ${isEditing ? "updating" : "creating"} label`, {
        description: "An unexpected error occurred. Please try again.",
        icon: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={isMobile ? "w-[calc(100%-32px)] p-4" : "sm:max-w-[500px]"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {isEditing ? "Edit Label" : "Create New Label"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update your label details below" : "Add a new label to your project"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pt-2 sm:pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Project <span className="text-destructive">*</span>
            </label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={loading}
                >
                  {formData.project_id
                    ? projects.find((project) => project.id === formData.project_id)?.name
                    : "Select project..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search project..." />
                  <CommandEmpty>No project found.</CommandEmpty>
                  <CommandGroup>
                    {projects.map((project) => (
                      <CommandItem
                        key={project.id}
                        value={project.name}
                        onSelect={() => {
                          setFormData({ ...formData, project_id: project.id })
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.project_id === project.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {project.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Label Name <span className="text-destructive">*</span>
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter label name"
              className="w-full"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter label description"
              className="w-full min-h-[80px] sm:min-h-[100px]"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as "draft" | "published" | "archived" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-2 sm:pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Label"
              ) : (
                "Create Label"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
