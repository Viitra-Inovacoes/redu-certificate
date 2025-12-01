import { Request } from 'express';
import { TemplatesService } from 'src/templates/templates.service';

export const getSignatureAuthorizationData = async (
  request: Request,
  templatesService: TemplatesService,
) => {
  const { signatureId, templateId } = request.params;

  if (signatureId) {
    return await templatesService.findOneBy({
      where: { signatures: { id: signatureId } },
      relations: { structure: true },
    });
  } else {
    return await templatesService.findOneBy({
      where: { id: templateId },
      relations: { structure: true },
    });
  }
};
