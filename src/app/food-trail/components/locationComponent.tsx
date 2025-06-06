'use client';

export default function LocationComponent({
  index,
  title,
  visited,
  handleDelete,
}: {
  index: number;
  title: string;
  visited: boolean;
  handleDelete: () => void;
}) {
  return (
    <tr>
      <td>{index + 1}</td>
      <td>{title}</td>
      <td>{visited ? 'Yes' : 'No'}</td>
      <td>
        <button onClick={handleDelete}>Delete</button>
      </td>
    </tr>
  );
}

