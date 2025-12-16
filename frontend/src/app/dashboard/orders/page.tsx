'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  notes?: string;
  pickupDate?: string;
  createdAt: string;
  completedAt?: string;
  contact: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  items: OrderItem[];
}

const statusConfig = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: '✅' },
  PREPARING: { label: 'En Preparación', color: 'bg-purple-100 text-purple-800', icon: '🔄' },
  READY: { label: 'Listo', color: 'bg-green-100 text-green-800', icon: '📦' },
  COMPLETED: { label: 'Entregado', color: 'bg-gray-100 text-gray-800', icon: '✔️' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: '❌' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [statusFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/orders', { params });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/orders/stats/summary');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/api/orders/${orderId}`, { status: newStatus });
      fetchOrders();
      fetchStats();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error al actualizar el pedido');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600 mt-1">Gestiona los pedidos de tus clientes mayoristas</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.byStatus.pending}</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Listos</p>
                <p className="text-2xl font-bold text-green-600">{stats.byStatus.ready}</p>
              </div>
              <div className="text-3xl">📦</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.revenue)}
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por número de pedido, cliente o teléfono..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="PREPARING">En Preparación</option>
            <option value="READY">Listo</option>
            <option value="COMPLETED">Entregado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Cargando pedidos...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron pedidos
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const config = statusConfig[order.status as keyof typeof statusConfig];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{order.orderNumber}</div>
                        {order.pickupDate && (
                          <div className="text-sm text-gray-500">
                            Retiro: {format(new Date(order.pickupDate), 'dd MMM', { locale: es })}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{order.contact.name}</div>
                        {order.contact.phone && (
                          <div className="text-sm text-gray-500">{order.contact.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{order.items.length} productos</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
                          {config.icon} {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: es })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalles */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowModal(false)}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedOrder.orderNumber}</h2>
                  <p className="text-gray-600">{selectedOrder.contact.name}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Estado actual */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado del pedido
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="PREPARING">En Preparación</option>
                  <option value="READY">Listo para Recoger</option>
                  <option value="COMPLETED">Entregado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>

              {/* Items del pedido */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Productos</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(item.subtotal)}</p>
                        <p className="text-sm text-gray-600">{formatCurrency(item.unitPrice)}/u</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {selectedOrder.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Notas</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Info adicional */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Fecha de creación:</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(selectedOrder.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                  </p>
                </div>
                {selectedOrder.pickupDate && (
                  <div>
                    <p className="text-gray-600">Fecha de retiro:</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(selectedOrder.pickupDate), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
