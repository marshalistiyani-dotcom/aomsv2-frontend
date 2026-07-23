export function Table({ children }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">{children}</table>
    </div>
  )
}

export function Thead({ children }) {
  return <thead className="bg-gray-50">{children}</thead>
}

export function Th({ children, className = '' }) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  )
}

export function Tbody({ children }) {
  return <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
}

export function Td({ children, className = '' }) {
  return <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${className}`}>{children}</td>
}
