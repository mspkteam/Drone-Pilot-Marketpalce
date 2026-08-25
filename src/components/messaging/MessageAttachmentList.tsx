type MessageAttachmentView = {
  url: string;
  name: string;
  contentType: string;
};

export function MessageAttachmentList({
  attachments,
}: {
  attachments: MessageAttachmentView[] | undefined;
}) {
  if (!attachments?.length) return null;
  return (
    <ul className="client-messages-attachments">
      {attachments.map((file) => (
        <li key={file.url}>
          <a href={file.url} target="_blank" rel="noreferrer">
            {file.name}
          </a>
        </li>
      ))}
    </ul>
  );
}
