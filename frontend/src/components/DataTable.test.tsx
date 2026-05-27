import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DataTable, { type Column } from './DataTable';

type Row = { id: string; name: string; value: number };

const columns: Column<Row>[] = [
  { key: 'name', label: 'Name', render: (r) => <span>{r.name}</span> },
  { key: 'value', label: 'Value', render: (r) => <span>{r.value}</span>, sortable: true },
];

const rows: Row[] = [
  { id: '1', name: 'Apple', value: 100 },
  { id: '2', name: 'Google', value: 200 },
];

describe('DataTable', () => {
  it('renders column headers and rows', () => {
    render(
      <DataTable columns={columns} data={rows} keyExtractor={(r) => r.id} />,
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
  });

  it('shows loading spinner when loading=true', () => {
    render(
      <DataTable columns={columns} data={[]} keyExtractor={(r) => r.id} loading />,
    );

    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    // table body not rendered while loading
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows empty state when data is empty', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        keyExtractor={(r) => r.id}
        emptyTitle="Nothing here"
        emptyDescription="Add something to get started."
      />,
    );

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Add something to get started.')).toBeInTheDocument();
  });

  it('calls onSort when sortable column header is clicked', () => {
    const onSort = vi.fn();

    render(
      <DataTable
        columns={columns}
        data={rows}
        keyExtractor={(r) => r.id}
        sortBy="name"
        sortOrder="asc"
        onSort={onSort}
      />,
    );

    fireEvent.click(screen.getByText('Value'));
    expect(onSort).toHaveBeenCalledWith('value');
  });

  it('renders optional header slot', () => {
    render(
      <DataTable
        columns={columns}
        data={rows}
        keyExtractor={(r) => r.id}
        header={<h3>My Table</h3>}
      />,
    );

    expect(screen.getByText('My Table')).toBeInTheDocument();
  });
});
