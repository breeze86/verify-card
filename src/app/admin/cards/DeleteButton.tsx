"use client";

interface DeleteButtonProps {
  cardId: string;
}

export default function DeleteButton({ cardId }: DeleteButtonProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm("确定要删除这张卡片吗？")) {
      e.preventDefault();
    }
  };

  return (
    <form
      action={`/admin/api/cards/${cardId}/delete`}
      method="POST"
      className="inline"
      onSubmit={handleSubmit}
    >
      <button
        type="submit"
        className="text-red-600 hover:text-red-900"
      >
        删除
      </button>
    </form>
  );
}
