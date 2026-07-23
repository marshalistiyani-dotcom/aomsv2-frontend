export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(date) {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date) {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusColor(status) {
  const colors = {
    todo: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
    upcoming: 'bg-purple-100 text-purple-700',
    ongoing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

export function getPriorityColor(priority) {
  const colors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  }
  return colors[priority] || 'bg-gray-100 text-gray-600'
}

export function getStatusLabel(status) {
  const labels = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
    upcoming: 'Upcoming',
    ongoing: 'Ongoing',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  return labels[status] || status
}

export function getPriorityLabel(priority) {
  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  }
  return labels[priority] || priority
}

export function isOverdue(dueDate) {
  return new Date(dueDate) < new Date(new Date().toDateString())
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function getProgressColor(pct) {
  if (pct >= 100) return 'bg-green-500'
  if (pct >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function getProgressTextColor(pct) {
  if (pct >= 100) return 'text-green-600'
  if (pct >= 50) return 'text-yellow-600'
  return 'text-red-600'
}
