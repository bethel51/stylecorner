import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Truck, XCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const s = (status || 'pending').toLowerCase();

  const getStatusConfig = () => {
    switch (s) {
      case 'accepted':
      case 'verified':
      case 'completed':
        return {
          label: s.toUpperCase(),
          className: 'status-accepted',
          icon: CheckCircle2,
        };
      case 'shipped':
        return {
          label: 'SHIPPED',
          className: 'status-shipped',
          icon: Truck,
        };
      case 'rejected':
      case 'unverified':
      case 'cancelled':
        return {
          label: s.toUpperCase(),
          className: 'status-rejected',
          icon: XCircle,
        };
      case 'pending':
      default:
        return {
          label: 'PENDING',
          className: 'status-pending',
          icon: Clock,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`status-badge ${config.className}`}>
      <Icon size={12} />
      <span>{config.label}</span>
    </span>
  );
};
