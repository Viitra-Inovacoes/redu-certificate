import { Injectable } from '@nestjs/common';
import { StructuresService } from 'src/structures/structures.service';
import {
  EnrollmentTime,
  EnrollmentTimeType,
  Template,
} from 'src/templates/entities/template.entity';

@Injectable()
export class RequirementsService {
  constructor(private readonly structureService: StructuresService) {}

  async canGenerate({ requirements, structure }: Template) {
    const { afterDate, progress, presence, grade, enrollmentTime } =
      requirements || {};

    if (!this.checkAfterDate(afterDate)) return false;

    const completion = await this.structureService.getCompletion(
      structure,
      grade?.type,
      grade?.id,
    );

    return (
      this.GreaterThan(progress, completion.progress) &&
      this.GreaterThan(grade?.value, completion.grade) &&
      this.GreaterThan(presence, completion.presence) &&
      this.checkMinimumEnrollmentTime(enrollmentTime, completion.enrolledAt)
    );
  }

  private checkAfterDate(required: Date | undefined) {
    if (typeof required === 'string') required = new Date(required);
    return this.GreaterThan(required, new Date());
  }

  private checkMinimumEnrollmentTime(
    enrollmentTime: EnrollmentTime | undefined,
    actual: Date,
  ) {
    const required = this.DateFromEnrollmentTime(enrollmentTime);
    if (typeof actual === 'string') actual = new Date(actual);
    return this.LessThan(required, actual);
  }

  private GreaterThan<T extends number | Date>(
    required: T | undefined,
    actual: T,
  ): boolean {
    if (!required) return true;
    return actual >= required;
  }

  private LessThan<T extends number | Date>(
    required: T | undefined,
    actual: T,
  ): boolean {
    if (!required) return true;
    return actual <= required;
  }

  private DateFromEnrollmentTime(enrollmentTime?: {
    type: EnrollmentTimeType;
    value: number;
  }) {
    if (!enrollmentTime) return undefined;

    const { type, value } = enrollmentTime;
    const currentTime = new Date().getTime();
    const multiplier = {
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
      weeks: 7 * 24 * 60 * 60 * 1000,
      months: 30 * 24 * 60 * 60 * 1000,
      years: 365 * 24 * 60 * 60 * 1000,
    };

    return new Date(currentTime - value * multiplier[type]);
  }
}
