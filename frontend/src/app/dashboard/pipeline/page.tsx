'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import api from '@/lib/api';
import { Phone, Mail, TrendingUp, Calendar, User } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  score: number;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST';
  source: string;
  assignedToId?: string;
  createdAt: string;
}

interface Column {
  id: string;
  title: string;
  status: Contact['status'];
  contacts: Contact[];
  color: string;
  bgColor: string;
  borderColor: string;
}

const statusConfig: Record<Contact['status'], { title: string; color: string; bgColor: string; borderColor: string }> = {
  NEW: {
    title: 'Nuevos',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
  },
  CONTACTED: {
    title: 'Contactados',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
  },
  QUALIFIED: {
    title: 'Calificados',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
  },
  PROPOSAL: {
    title: 'En Propuesta',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
  },
  WON: {
    title: 'Ganados',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
  },
  LOST: {
    title: 'Perdidos',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
  },
};

export default function PipelinePage() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await api.get('/api/contacts');
      const contacts: Contact[] = response.data;

      // Agrupar contactos por estado
      const columnData: Column[] = Object.keys(statusConfig).map((status) => ({
        id: status,
        title: statusConfig[status as Contact['status']].title,
        status: status as Contact['status'],
        contacts: contacts.filter((c) => c.status === status),
        color: statusConfig[status as Contact['status']].color,
        bgColor: statusConfig[status as Contact['status']].bgColor,
        borderColor: statusConfig[status as Contact['status']].borderColor,
      }));

      setColumns(columnData);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Si no hay destino válido
    if (!destination) return;

    // Si se suelta en la misma posición
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destColumn = columns.find((col) => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const contact = sourceColumn.contacts.find((c) => c.id === draggableId);
    if (!contact) return;

    // Actualizar estado local inmediatamente
    const newColumns = columns.map((col) => {
      if (col.id === source.droppableId) {
        return {
          ...col,
          contacts: col.contacts.filter((c) => c.id !== draggableId),
        };
      }
      if (col.id === destination.droppableId) {
        const newContacts = [...col.contacts];
        newContacts.splice(destination.index, 0, { ...contact, status: col.status });
        return {
          ...col,
          contacts: newContacts,
        };
      }
      return col;
    });

    setColumns(newColumns);

    // Actualizar en el backend
    try {
      await api.put(`/api/contacts/${draggableId}`, {
        status: destColumn.status,
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      // Revertir cambios en caso de error
      loadContacts();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredColumns = columns.map((col) => ({
    ...col,
    contacts: col.contacts.filter((contact) => {
      if (filter === 'all') return true;
      if (filter === 'high') return contact.score >= 80;
      if (filter === 'medium') return contact.score >= 60 && contact.score < 80;
      if (filter === 'low') return contact.score < 60;
      return true;
    }),
  }));

  const totalValue = columns.reduce((acc, col) => {
    if (col.status === 'WON') {
      return acc + col.contacts.length * 1000; // Valor estimado por cliente ganado
    }
    return acc;
  }, 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-1 h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pipeline de Ventas</h1>
            <p className="text-gray-600 mt-1">Arrastra y suelta los contactos para cambiar su estado</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Valor Total</p>
                <p className="text-lg font-bold text-gray-900">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Filtrar por score:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'high'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Alto (80+)
          </button>
          <button
            onClick={() => setFilter('medium')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'medium'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Medio (60-79)
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'low'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bajo (&lt;60)
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {filteredColumns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80 flex flex-col">
              {/* Column Header */}
              <div className={`${column.bgColor} ${column.borderColor} border-2 rounded-t-lg p-4`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${column.color}`}>{column.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${column.bgColor} ${column.color}`}>
                    {column.contacts.length}
                  </span>
                </div>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 bg-gray-50 border-l-2 border-r-2 border-b-2 ${column.borderColor} rounded-b-lg p-2 min-h-[400px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="space-y-2">
                      {column.contacts.map((contact, index) => (
                        <Draggable key={contact.id} draggableId={contact.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-move ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
                              }`}
                            >
                              {/* Contact Card */}
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <h4 className="font-semibold text-gray-900 text-sm">{contact.name}</h4>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(contact.score)}`}>
                                    {contact.score}
                                  </span>
                                </div>

                                {contact.email && (
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate">{contact.email}</span>
                                  </div>
                                )}

                                {contact.phone && (
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Phone className="w-3 h-3" />
                                    <span>{contact.phone}</span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                  <span className="text-xs text-gray-500 capitalize">{contact.source.toLowerCase()}</span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(contact.createdAt).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
