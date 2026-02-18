import { useState, useEffect } from 'react'
import { Modal, Input, Textarea, Select, Button } from '../ui'

const INITIAL = {
  title: '', description: '', priority: 'medium',
  status: 'todo', tags: '', dueDate: '',
}

const validate = (f) => {
  const e = {}
  if (!f.title.trim()) e.title = 'Title is required'
  if (f.title.length > 100) e.title = 'Max 100 characters'
  if (f.description.length > 1000) e.description = 'Max 1000 characters'
  if (f.tags) {
    const arr = f.tags.split(',').map(t => t.trim()).filter(Boolean)
    if (arr.length > 10) e.tags = 'Max 10 tags'
  }
  return e
}

export default function TaskFormModal({ open, onClose, onSubmit, task, loading }) {
  const isEdit = !!task
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        tags: (task.tags || []).join(', '),
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      })
    } else {
      setForm(INITIAL)
    }
    setErrors({})
  }, [task, open])

  const change = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors((er) => ({ ...er, [e.target.name]: '' }))
  }

  const submit = (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: form.status,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      ...(form.dueDate && { dueDate: new Date(form.dueDate).toISOString() }),
    }
    onSubmit(payload)
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit task' : 'New task'} size="md">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input
          label="Title *"
          name="title"
          placeholder="What needs to be done?"
          value={form.title}
          onChange={change}
          error={errors.title}
          autoFocus
        />
        <Textarea
          label="Description"
          name="description"
          placeholder="Add details, context, notes..."
          value={form.description}
          onChange={change}
          error={errors.description}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select label="Priority" name="priority" value={form.priority} onChange={change}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>

          <Select label="Status" name="status" value={form.status} onChange={change}>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </Select>
        </div>

        <Input
          label="Due date"
          name="dueDate"
          type="date"
          value={form.dueDate}
          onChange={change}
        />

        <Input
          label="Tags (comma-separated)"
          name="tags"
          placeholder="backend, design, urgent"
          value={form.tags}
          onChange={change}
          error={errors.tags}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {isEdit ? 'Save changes' : 'Create task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
