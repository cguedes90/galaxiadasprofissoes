'use client'

interface SearchBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedArea: string
  setSelectedArea: (area: string) => void
  areas: string[]
  onAddProfession: () => void
  onContact: () => void
}

export default function SearchBar({ 
  searchQuery, 
  setSearchQuery, 
  selectedArea, 
  setSelectedArea, 
  areas,
  onAddProfession,
  onContact
}: SearchBarProps) {
  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex flex-col sm:flex-row gap-2 sm:gap-3">
      <div className="flex-1 max-w-sm relative">
        <input
          type="text"
          placeholder="Buscar profissão..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white bg-opacity-20 backdrop-blur-md text-white placeholder-gray-300 rounded-lg border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          🔍
        </div>
      </div>
      
      <select
        value={selectedArea}
        onChange={(e) => setSelectedArea(e.target.value)}
        className="px-3 py-2 text-sm bg-white bg-opacity-20 backdrop-blur-md text-white rounded-lg border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 sm:min-w-[130px]"
      >
        <option value="" className="text-gray-800">Todas as áreas</option>
        {areas.map(area => (
          <option key={area} value={area} className="text-gray-800">
            {area}
          </option>
        ))}
      </select>
      
      <button
        onClick={onAddProfession}
        className="px-4 py-2 text-sm bg-green-500 bg-opacity-80 hover:bg-opacity-100 text-white rounded-lg transition-all hover:scale-105 font-medium shadow-lg"
      >
        ➕ Incluir Profissão
      </button>
      
      <button
        onClick={onContact}
        className="px-4 py-2 text-sm bg-blue-500 bg-opacity-80 hover:bg-opacity-100 text-white rounded-lg transition-all hover:scale-105 font-medium shadow-lg"
      >
        📧 Contato
      </button>
      
      {(searchQuery || selectedArea) && (
        <button
          onClick={() => {
            setSearchQuery('')
            setSelectedArea('')
          }}
          className="px-3 py-2 text-sm bg-red-500 bg-opacity-70 hover:bg-opacity-90 text-white rounded-lg transition-colors"
        >
          Limpar
        </button>
      )}
    </div>
  )
}