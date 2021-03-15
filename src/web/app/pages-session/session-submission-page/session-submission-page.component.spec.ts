import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { FeedbackQuestionsService } from '../../../services/feedback-questions.service';
import { FeedbackResponseCommentService } from '../../../services/feedback-response-comment.service';
import { FeedbackResponsesService } from '../../../services/feedback-responses.service';
import { FeedbackSessionsService } from '../../../services/feedback-sessions.service';
import { InstructorService } from '../../../services/instructor.service';
import { NavigationService } from '../../../services/navigation.service';
import { SimpleModalService } from '../../../services/simple-modal.service';
import { StudentService } from '../../../services/student.service';
import {
  AuthInfo,
  CommentVisibilityType,
  FeedbackParticipantType,
  FeedbackQuestionRecipients,
  FeedbackQuestionType,
  FeedbackResponse,
  FeedbackResponseComment,
  FeedbackSession,
  FeedbackSessionPublishStatus,
  FeedbackSessionSubmissionStatus,
  FeedbackVisibilityType,
  Instructor,
  JoinState,
  NumberOfEntitiesToGiveFeedbackToSetting,
  RegkeyValidity,
  ResponseVisibleSetting,
  SessionVisibleSetting,
  Student,
} from '../../../types/api-output';
import { Intent } from '../../../types/api-request';
import { AjaxLoadingModule } from '../../components/ajax-loading/ajax-loading.module';
import { CommentRowModel } from '../../components/comment-box/comment-row/comment-row.component';
import { LoadingRetryModule } from '../../components/loading-retry/loading-retry.module';
import { LoadingSpinnerModule } from '../../components/loading-spinner/loading-spinner.module';
import {
  FeedbackResponseRecipientSubmissionFormModel,
  QuestionSubmissionFormModel,
} from '../../components/question-submission-form/question-submission-form-model';
import {
  QuestionSubmissionFormModule,
} from '../../components/question-submission-form/question-submission-form.module';
import { TeammatesCommonModule } from '../../components/teammates-common/teammates-common.module';
import { SavingCompleteModalComponent } from './saving-complete-modal/saving-complete-modal.component';
import { FeedbackResponsesResponse, SessionSubmissionPageComponent } from './session-submission-page.component';
import Spy = jasmine.Spy;

describe('SessionSubmissionPageComponent', () => {
  const deepCopy: any = (obj: any) => JSON.parse(JSON.stringify(obj));

  const testStudent: Student = {
    email: 'alice@tmms.com',
    courseId: 'course-id',
    name: 'Alice Betsy',
    teamName: 'Team 1',
    sectionName: 'Section 1',
  };

  const testInstructor: Instructor = {
    courseId: 'course-id',
    email: 'test@example.com',
    name: 'Instructor Ho',
    joinState: JoinState.JOINED,
  };

  const testOpenFeedbackSession: FeedbackSession = {
    feedbackSessionName: 'First Session',
    courseId: 'CS1231',
    timeZone: 'Asia/Singapore',
    instructions: 'Instructions',
    submissionStartTimestamp: 1000000000000,
    submissionEndTimestamp: 1500000000000,
    gracePeriod: 0,
    sessionVisibleSetting: SessionVisibleSetting.AT_OPEN,
    responseVisibleSetting: ResponseVisibleSetting.AT_VISIBLE,
    submissionStatus: FeedbackSessionSubmissionStatus.OPEN,
    publishStatus: FeedbackSessionPublishStatus.PUBLISHED,
    isClosingEmailEnabled: true,
    isPublishedEmailEnabled: true,
    createdAtTimestamp: 0,
  };

  const testClosedFeedbackSession: FeedbackSession = {
    feedbackSessionName: 'Second Session',
    courseId: 'CFG1010',
    timeZone: 'Asia/Singapore',
    instructions: 'Roots and Shoots',
    submissionStartTimestamp: 1500000000000,
    submissionEndTimestamp: 2000000000000,
    gracePeriod: 0,
    sessionVisibleSetting: SessionVisibleSetting.AT_OPEN,
    responseVisibleSetting: ResponseVisibleSetting.AT_VISIBLE,
    submissionStatus: FeedbackSessionSubmissionStatus.CLOSED,
    publishStatus: FeedbackSessionPublishStatus.PUBLISHED,
    isClosingEmailEnabled: true,
    isPublishedEmailEnabled: true,
    createdAtTimestamp: 0,
  };

  const testVisibleNotOpenFeedbackSession: FeedbackSession = {
    feedbackSessionName: 'Third Session',
    courseId: 'IS1103',
    timeZone: 'Asia/Singapore',
    instructions: 'Utilitarianism for Dummies',
    submissionStartTimestamp: 2000000000000,
    submissionEndTimestamp: 2500000000000,
    gracePeriod: 0,
    sessionVisibleSetting: SessionVisibleSetting.AT_OPEN,
    responseVisibleSetting: ResponseVisibleSetting.AT_VISIBLE,
    submissionStatus: FeedbackSessionSubmissionStatus.VISIBLE_NOT_OPEN,
    publishStatus: FeedbackSessionPublishStatus.PUBLISHED,
    isClosingEmailEnabled: true,
    isPublishedEmailEnabled: true,
    createdAtTimestamp: 0,
  };

  const testRecipientSubmissionForm1: FeedbackResponseRecipientSubmissionFormModel = {
    responseId: 'response-id-1',
    recipientIdentifier: 'recipient-identifier',
    responseDetails: { questionType: FeedbackQuestionType.MCQ },
    isValid: true,
    commentByGiver: {
      originalComment: {
        commentGiver: 'comment giver',
        lastEditorEmail: 'last-editor@email.com',
        feedbackResponseCommentId: 1,
        commentText: 'comment text',
        createdAt: 10000000,
        lastEditedAt: 20000000,
        isVisibilityFollowingFeedbackQuestion: true,
        showCommentTo: [CommentVisibilityType.GIVER, CommentVisibilityType.RECIPIENT],
        showGiverNameTo: [CommentVisibilityType.GIVER, CommentVisibilityType.RECIPIENT],
      },
      commentEditFormModel: {
        commentText: 'comment text here',
        isUsingCustomVisibilities: false,
        showCommentTo: [CommentVisibilityType.GIVER, CommentVisibilityType.RECIPIENT],
        showGiverNameTo: [CommentVisibilityType.GIVER, CommentVisibilityType.RECIPIENT],
      },
      isEditing: false,
    },
  };

  const testRecipientSubmissionForm2: FeedbackResponseRecipientSubmissionFormModel = {
    responseId: 'response-id-2',
    recipientIdentifier: 'recipient-identifier',
    responseDetails: { questionType: FeedbackQuestionType.MCQ },
    isValid: true,
    commentByGiver: {
      commentEditFormModel: {
        commentText: 'comment text here',
        isUsingCustomVisibilities: false,
        showCommentTo: [CommentVisibilityType.GIVER, CommentVisibilityType.RECIPIENT],
        showGiverNameTo: [CommentVisibilityType.GIVER, CommentVisibilityType.RECIPIENT],
      },
      isEditing: false,
    },
  };

  const testRecipientSubmissionForm3: FeedbackResponseRecipientSubmissionFormModel = {
    responseId: 'response-id-3',
    recipientIdentifier: 'recipient-identifier',
    responseDetails: { questionType: FeedbackQuestionType.MCQ },
    isValid: true,
    commentByGiver: {
      originalComment: {
        commentGiver: 'comment giver',
        lastEditorEmail: 'last-editor@email.com',
        feedbackResponseCommentId: 1,
        commentText: 'comment text',
        createdAt: 10000000,
        lastEditedAt: 20000000,
        isVisibilityFollowingFeedbackQuestion: true,
        showCommentTo: [CommentVisibilityType.GIVER, CommentVisibilityType.RECIPIENT],
        showGiverNameTo: [CommentVisibilityType.GIVER, CommentVisibilityType.RECIPIENT],
      },
      commentEditFormModel: {
        commentText: '',
        isUsingCustomVisibilities: false,
        showCommentTo: [CommentVisibilityType.GIVER, CommentVisibilityType.RECIPIENT],
        showGiverNameTo: [CommentVisibilityType.GIVER, CommentVisibilityType.RECIPIENT],
      },
      isEditing: false,
    },
  };

  const testResponse1: FeedbackResponse = {
    feedbackResponseId: 'response-id-1',
    giverIdentifier: 'giver-identifier',
    recipientIdentifier: 'bebopie',
    responseDetails: {
      questionType: FeedbackQuestionType.MCQ,
    },
  };

  const testResponse2: FeedbackResponse = {
    feedbackResponseId: 'response-id-2',
    giverIdentifier: 'giver-identifier',
    recipientIdentifier: 'bluesie',
    responseDetails: {
      questionType: FeedbackQuestionType.TEXT,
    },
  };

  const testQuestionSubmissionForm1: QuestionSubmissionFormModel = {
    feedbackQuestionId: 'feedback-question-id-1',
    questionNumber: 10,
    questionBrief: 'question brief',
    questionDescription: 'question description',
    questionType: FeedbackQuestionType.MCQ,
    questionDetails: {
      questionType: FeedbackQuestionType.MCQ,
      questionText: 'question text',
    },
    giverType: FeedbackParticipantType.GIVER,
    recipientType: FeedbackParticipantType.RECEIVER,
    recipientList: [],
    recipientSubmissionForms: [testRecipientSubmissionForm1],
    numberOfEntitiesToGiveFeedbackToSetting: NumberOfEntitiesToGiveFeedbackToSetting.UNLIMITED,
    customNumberOfEntitiesToGiveFeedbackTo: 5,
    showResponsesTo: [],
    showGiverNameTo: [],
    showRecipientNameTo: [],
  };

  const testQuestionSubmissionForm2: QuestionSubmissionFormModel = {
    feedbackQuestionId: 'feedback-question-id-2',
    questionNumber: 20,
    questionBrief: 'question brief',
    questionDescription: 'question description',
    questionType: FeedbackQuestionType.MCQ,
    questionDetails: {
      questionType: FeedbackQuestionType.MCQ,
      questionText: 'question text',
    },
    giverType: FeedbackParticipantType.GIVER,
    recipientType: FeedbackParticipantType.RECEIVER,
    recipientList: [],
    recipientSubmissionForms: [],
    numberOfEntitiesToGiveFeedbackToSetting: NumberOfEntitiesToGiveFeedbackToSetting.UNLIMITED,
    customNumberOfEntitiesToGiveFeedbackTo: 5,
    showResponsesTo: [],
    showGiverNameTo: [],
    showRecipientNameTo: [],
  };

  const testQuestionSubmissionForm3: QuestionSubmissionFormModel = {
    feedbackQuestionId: 'feedback-question-id-3',
    questionNumber: 30,
    questionBrief: 'question brief',
    questionDescription: 'question description',
    questionType: FeedbackQuestionType.MCQ,
    questionDetails: {
      questionType: FeedbackQuestionType.MCQ,
      questionText: 'question text',
    },
    giverType: FeedbackParticipantType.OWN_TEAM_MEMBERS,
    recipientType: FeedbackParticipantType.STUDENTS,
    recipientList: [
      {
        recipientName: 'Barry Harris',
        recipientIdentifier: 'bebopie',
      },
      {
        recipientName: 'Gene Harris',
        recipientIdentifier: 'bluesie',
      },
    ],
    recipientSubmissionForms: [
      {
        recipientIdentifier: 'bebopie',
        responseDetails: {
          questionType: FeedbackQuestionType.MCQ,
        },
        responseId: 'response-id-1',
        isValid: true,
      },
      {
        recipientIdentifier: 'bluesie',
        responseDetails: {
          questionType: FeedbackQuestionType.TEXT,
        },
        responseId: 'response-id-2',
        isValid: true,
      },
    ],
    numberOfEntitiesToGiveFeedbackToSetting: NumberOfEntitiesToGiveFeedbackToSetting.UNLIMITED,
    customNumberOfEntitiesToGiveFeedbackTo: 5,
    showResponsesTo: [FeedbackVisibilityType.RECIPIENT, FeedbackVisibilityType.INSTRUCTORS],
    showGiverNameTo: [FeedbackVisibilityType.RECIPIENT, FeedbackVisibilityType.INSTRUCTORS],
    showRecipientNameTo: [FeedbackVisibilityType.RECIPIENT, FeedbackVisibilityType.INSTRUCTORS],
  };

  const testInfo: AuthInfo = {
    masquerade: false,
    user: {
      id: 'user-id',
      isAdmin: false,
      isInstructor: false,
      isStudent: true,
    },
  };

  const testQueryParams: any = {
    courseid: 'CS3281',
    fsname: 'Feedback Session Name',
    key: 'reg-key',
  };

  const getFeedbackSessionArgs: any = {
    courseId: testQueryParams.courseid,
    feedbackSessionName: testQueryParams.fsname,
    intent: Intent.STUDENT_SUBMISSION,
    key: testQueryParams.key,
    moderatedPerson: '',
    previewAs: '',
  };

  let component: SessionSubmissionPageComponent;
  let fixture: ComponentFixture<SessionSubmissionPageComponent>;
  let authService: AuthService;
  let navService: NavigationService;
  let studentService: StudentService;
  let instructorService: InstructorService;
  let feedbackSessionsService: FeedbackSessionsService;
  let feedbackResponsesService: FeedbackResponsesService;
  let feedbackResponseCommentService: FeedbackResponseCommentService;
  let feedbackQuestionsService: FeedbackQuestionsService;
  let simpleModalService: SimpleModalService;
  let ngbModal: NgbModal;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SessionSubmissionPageComponent, SavingCompleteModalComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        NgxPageScrollCoreModule,
        TeammatesCommonModule,
        FormsModule,
        AjaxLoadingModule,
        QuestionSubmissionFormModule,
        LoadingSpinnerModule,
        LoadingRetryModule,
      ],
      providers: [
        AuthService,
        NavigationService,
        StudentService,
        FeedbackSessionsService,
        SimpleModalService,
        {
          provide: ActivatedRoute,
          useValue: {
            data: {
              intent: Intent.STUDENT_SUBMISSION,
              pipe: () => {
                return {
                  subscribe: (fn: (value: any) => void) => fn(testQueryParams),
                };
              },
            },
          },
        },
      ],
    })
    .overrideModule(BrowserModule, { set: { entryComponents: [SavingCompleteModalComponent] } })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionSubmissionPageComponent);
    authService = TestBed.inject(AuthService);
    navService = TestBed.inject(NavigationService);
    studentService = TestBed.inject(StudentService);
    instructorService = TestBed.inject(InstructorService);
    feedbackQuestionsService = TestBed.inject(FeedbackQuestionsService);
    feedbackResponsesService = TestBed.inject(FeedbackResponsesService);
    feedbackResponseCommentService = TestBed.inject(FeedbackResponseCommentService);
    feedbackSessionsService = TestBed.inject(FeedbackSessionsService);
    simpleModalService = TestBed.inject(SimpleModalService);
    ngbModal = TestBed.inject(NgbModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should snap with default fields', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should snap when feedback session questions have failed to load', () => {
    component.retryAttempts = 0;
    component.hasFeedbackSessionQuestionsLoadingFailed = true;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should snap when saving responses', () => {
    component.isSavingResponses = true;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should snap with user that is logged in and using session link', () => {
    component.regKey = 'session-link-key';
    component.loggedInUser = 'alice';
    component.personName = 'alice';
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should snap with user that is not logged in and using session link', () => {
    component.regKey = 'session-link-key';
    component.loggedInUser = '';
    component.personName = 'alice';
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should snap with feedback session question submission forms', () => {
    component.questionSubmissionForms = [
      testQuestionSubmissionForm1,
      testQuestionSubmissionForm2,
      testQuestionSubmissionForm3,
    ];
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should snap with feedback session question submission forms when disabled', () => {
    component.isSubmissionFormsDisabled = true;
    component.questionSubmissionForms = [
      testQuestionSubmissionForm1,
      testQuestionSubmissionForm2,
      testQuestionSubmissionForm3,
    ];
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should fetch auth info on init', () => {
    spyOn(authService, 'getAuthUser').and.returnValue(of(testInfo));
    component.ngOnInit();
    expect(component.intent).toEqual(Intent.STUDENT_SUBMISSION);
    expect(component.courseId).toEqual(testQueryParams.courseid);
    expect(component.feedbackSessionName).toEqual(testQueryParams.fsname);
    expect(component.regKey).toEqual(testQueryParams.key);
    expect(component.loggedInUser).toEqual(testInfo.user?.id);
  });

  it('should verify allowed access with used reg key', () => {
    const testValidity: RegkeyValidity = {
      isAllowedAccess: true,
      isUsed: true,
      isValid: false,
    };
    spyOn(authService, 'getAuthUser').and.returnValue(of(testInfo));
    spyOn(authService, 'getAuthRegkeyValidity').and.returnValue(of(testValidity));
    const navSpy: Spy = spyOn(navService, 'navigateByURLWithParamEncoding');

    component.ngOnInit();

    expect(navSpy.calls.count()).toEqual(1);
    expect(navSpy.calls.mostRecent().args[1]).toEqual('/web/student/sessions/submission');
  });

  it('should deny unallowed access with valid reg key for logged in user', () => {
    const testValidity: RegkeyValidity = {
      isAllowedAccess: false,
      isUsed: false,
      isValid: true,
    };
    spyOn(authService, 'getAuthUser').and.returnValue(of(testInfo));
    spyOn(authService, 'getAuthRegkeyValidity').and.returnValue(of(testValidity));
    const navSpy: Spy = spyOn(navService, 'navigateWithErrorMessage');

    component.ngOnInit();

    expect(navSpy.calls.count()).toEqual(1);
    expect(navSpy.calls.mostRecent().args[1]).toEqual('/web/front');
  });

  it('should deny unallowed access with invalid reg key', () => {
    const testValidity: RegkeyValidity = {
      isAllowedAccess: false,
      isUsed: false,
      isValid: false,
    };
    spyOn(authService, 'getAuthUser').and.returnValue(of(testInfo));
    spyOn(authService, 'getAuthRegkeyValidity').and.returnValue(of(testValidity));
    const navSpy: Spy = spyOn(navService, 'navigateWithErrorMessage');

    component.ngOnInit();

    expect(navSpy.calls.count()).toEqual(1);
    expect(navSpy.calls.mostRecent().args[1]).toEqual('/web/front');
  });

  it('should load a student name', () => {
    component.intent = Intent.STUDENT_SUBMISSION;
    spyOn(studentService, 'getStudent').and.returnValue(of(testStudent));
    component.loadPersonName();
    expect(component.personName).toEqual(testStudent.name);
    expect(component.personEmail).toEqual(testStudent.email);
  });

  it('should load an instructor name', () => {
    component.intent = Intent.INSTRUCTOR_SUBMISSION;
    spyOn(instructorService, 'getInstructor').and.returnValue(of(testInstructor));
    component.loadPersonName();
    expect(component.personName).toEqual(testInstructor.name);
    expect(component.personEmail).toEqual(testInstructor.email);
  });

  it('should join course for unregistered student', () => {
    const navSpy: Spy = spyOn(navService, 'navigateByURL');
    component.joinCourseForUnregisteredStudent();
    expect(navSpy.calls.count()).toEqual(1);
    expect(navSpy.calls.mostRecent().args[1]).toEqual('/web/join');
    expect(navSpy.calls.mostRecent().args[2]).toEqual({ entitytype: 'student', key: testQueryParams.key });
  });

  it('should load an open feedback session', () => {
    const fsSpy: Spy = spyOn(feedbackSessionsService, 'getFeedbackSession')
        .and.returnValue(of(testOpenFeedbackSession));
    const modalSpy: Spy = spyOn(simpleModalService, 'openInformationModal');

    component.loadFeedbackSession();

    expect(fsSpy.calls.count()).toEqual(1);
    expect(fsSpy.calls.mostRecent().args[0]).toEqual(getFeedbackSessionArgs);
    expect(modalSpy.calls.count()).toEqual(1);
    expect(modalSpy.calls.mostRecent().args[0]).toEqual('Feedback Session Will Be Closing Soon!');
    expect(component.feedbackSessionInstructions).toEqual(testOpenFeedbackSession.instructions);
    expect(component.feedbackSessionSubmissionStatus).toEqual(testOpenFeedbackSession.submissionStatus);
    expect(component.feedbackSessionTimezone).toEqual(testOpenFeedbackSession.timeZone);
    expect(component.isSubmissionFormsDisabled).toEqual(false);
  });

  it('should load a closed feedback session', () => {
    const fsSpy: Spy = spyOn(feedbackSessionsService, 'getFeedbackSession')
        .and.returnValue(of(testClosedFeedbackSession));
    const modalSpy: Spy = spyOn(simpleModalService, 'openInformationModal');

    component.loadFeedbackSession();

    expect(fsSpy.calls.count()).toEqual(1);
    expect(fsSpy.calls.mostRecent().args[0]).toEqual(getFeedbackSessionArgs);
    expect(modalSpy.calls.count()).toEqual(1);
    expect(modalSpy.calls.mostRecent().args[0]).toEqual('Feedback Session Closed');
    expect(component.feedbackSessionInstructions).toEqual(testClosedFeedbackSession.instructions);
    expect(component.feedbackSessionSubmissionStatus).toEqual(testClosedFeedbackSession.submissionStatus);
    expect(component.feedbackSessionTimezone).toEqual(testClosedFeedbackSession.timeZone);
    expect(component.isSubmissionFormsDisabled).toEqual(true);
  });

  it('should load a visible not open feedback session', () => {
    const fsSpy: Spy = spyOn(feedbackSessionsService, 'getFeedbackSession')
        .and.returnValue(of(testVisibleNotOpenFeedbackSession));
    const modalSpy: Spy = spyOn(simpleModalService, 'openInformationModal');

    component.loadFeedbackSession();

    expect(fsSpy.calls.count()).toEqual(1);
    expect(fsSpy.calls.mostRecent().args[0]).toEqual(getFeedbackSessionArgs);
    expect(modalSpy.calls.count()).toEqual(1);
    expect(modalSpy.calls.mostRecent().args[0]).toEqual('Feedback Session Not Open');
    expect(component.feedbackSessionInstructions).toEqual(testVisibleNotOpenFeedbackSession.instructions);
    expect(component.feedbackSessionSubmissionStatus).toEqual(testVisibleNotOpenFeedbackSession.submissionStatus);
    expect(component.feedbackSessionTimezone).toEqual(testVisibleNotOpenFeedbackSession.timeZone);
    expect(component.isSubmissionFormsDisabled).toEqual(true);
  });

  it('should redirect when loading non-existent feedback session', () => {
    spyOn(feedbackSessionsService, 'getFeedbackSession').and.returnValue(throwError({
      error: { message: 'This is an error' },
      status: 404,
    }));
    const navSpy: Spy = spyOn(navService, 'navigateWithErrorMessage');
    const modalSpy: Spy = spyOn(simpleModalService, 'openInformationModal');

    component.loadFeedbackSession();

    expect(modalSpy.calls.count()).toEqual(1);
    expect(modalSpy.calls.mostRecent().args[0]).toEqual('Feedback Session Does Not Exist!');
    expect(navSpy.calls.count()).toEqual(1);
    expect(navSpy.calls.mostRecent().args[1]).toEqual('/web/student/home');
  });

  it('should load feedback questions', () => {
    const testFeedbackQuestions: any = {
      questions: [
        {
          feedbackQuestionId: testQuestionSubmissionForm3.feedbackQuestionId,
          questionNumber: testQuestionSubmissionForm3.questionNumber,
          questionBrief: testQuestionSubmissionForm3.questionBrief,
          questionDescription: testQuestionSubmissionForm3.questionDescription,
          questionDetails: testQuestionSubmissionForm3.questionDetails,
          questionType: testQuestionSubmissionForm3.questionType,
          giverType: testQuestionSubmissionForm3.giverType,
          recipientType: testQuestionSubmissionForm3.recipientType,
          numberOfEntitiesToGiveFeedbackToSetting: testQuestionSubmissionForm3.numberOfEntitiesToGiveFeedbackToSetting,
          customNumberOfEntitiesToGiveFeedbackTo: testQuestionSubmissionForm3.customNumberOfEntitiesToGiveFeedbackTo,
          showResponsesTo: testQuestionSubmissionForm3.showResponsesTo,
          showGiverNameTo: testQuestionSubmissionForm3.showGiverNameTo,
          showRecipientNameTo: testQuestionSubmissionForm3.showRecipientNameTo,
        },
      ],
    };
    const testFeedbackQuestionRecipients: FeedbackQuestionRecipients = {
      recipients: [
        {
          name: 'Barry Harris',
          identifier: 'bebopie',
        },
        {
          name: 'Gene Harris',
          identifier: 'bluesie',
        },
      ],
    };
    const testExistingResponses: FeedbackResponsesResponse = {
      responses: [testResponse1, testResponse2],
    };

    spyOn(feedbackQuestionsService, 'getFeedbackQuestions').and.returnValue(of(testFeedbackQuestions));
    spyOn(feedbackQuestionsService, 'loadFeedbackQuestionRecipients')
        .and.returnValue(of(testFeedbackQuestionRecipients));
    spyOn(feedbackResponsesService, 'getFeedbackResponse').and.returnValue(of(testExistingResponses));

    component.loadFeedbackQuestions();

    expect(component.questionSubmissionForms.length).toEqual(1);
    expect(component.questionSubmissionForms[0]).toEqual(testQuestionSubmissionForm3);
  });

  it('should get comment model', () => {
    const testComment: FeedbackResponseComment = {
      commentGiver: 'comment giver',
      lastEditorEmail: 'last-editor@email.com',
      feedbackResponseCommentId: 5,
      commentText: 'comment text',
      createdAt: 10000000,
      lastEditedAt: 10000000,
      isVisibilityFollowingFeedbackQuestion: true,
      showGiverNameTo: [CommentVisibilityType.GIVER, CommentVisibilityType.INSTRUCTORS],
      showCommentTo: [CommentVisibilityType.GIVER, CommentVisibilityType.INSTRUCTORS],
    };
    const expectedCommentModel: CommentRowModel = {
      originalComment: testComment,
      commentEditFormModel: {
        commentText: testComment.commentText,
        isUsingCustomVisibilities: false,
        showCommentTo: [],
        showGiverNameTo: [],
      },
      timezone: '',
      isEditing: false,
    };
    const commentModel: CommentRowModel = component.getCommentModel(testComment);
    expect(commentModel).toEqual(expectedCommentModel);
  });

  it('should check that there are responses to submit', () => {
    component.questionSubmissionForms = [testQuestionSubmissionForm1];
    expect(component.hasAnyResponseToSubmit).toEqual(true);
  });

  it('should check that there are no responses to submit', () => {
    component.questionSubmissionForms = [testQuestionSubmissionForm2];
    expect(component.hasAnyResponseToSubmit).toEqual(false);
  });

  it('should save feedback responses', () => {
    component.personEmail = 'john@email.com';
    component.personName = 'john-wick';
    component.questionSubmissionForms = [
      deepCopy(testQuestionSubmissionForm1),
      deepCopy(testQuestionSubmissionForm2),
      deepCopy(testQuestionSubmissionForm3),
    ];
    spyOn(feedbackResponsesService, 'isFeedbackResponseDetailsEmpty').and.returnValue(false);
    spyOn(feedbackResponsesService, 'submitFeedbackResponses').and.callFake((responseId: string) => {
      if (responseId === testQuestionSubmissionForm1.feedbackQuestionId) {
        return of({ responses: [testResponse1] });
      }
      if (responseId === testQuestionSubmissionForm2.feedbackQuestionId) {
        return of({ responses: [testResponse2] });
      }
      return of({ responses: [] });
    });
    spyOn(feedbackResponseCommentService, 'createComment').and.returnValue(of({}));
    const fakeModalRef: any = { componentInstance: {} };
    spyOn(ngbModal, 'open').and.returnValue(fakeModalRef);

    component.saveFeedbackResponses();

    expect(fakeModalRef.componentInstance.requestIds).toEqual({ 'feedback-question-id-1': '', 'feedback-question-id-2': '', 'feedback-question-id-3': '' });
    expect(fakeModalRef.componentInstance.courseId).toEqual('CS3281');
    expect(fakeModalRef.componentInstance.feedbackSessionName).toEqual('Feedback Session Name');
    expect(fakeModalRef.componentInstance.feedbackSessionTimezone).toEqual('');
    expect(fakeModalRef.componentInstance.personEmail).toEqual('john@email.com');
    expect(fakeModalRef.componentInstance.personName).toEqual('john-wick');
    const expectedQuestionSubmissionForm1: QuestionSubmissionFormModel = deepCopy(testQuestionSubmissionForm1);
    const expectedQuestionSubmissionForm2: QuestionSubmissionFormModel = deepCopy(testQuestionSubmissionForm2);
    const expectedQuestionSubmissionForm3: QuestionSubmissionFormModel = deepCopy(testQuestionSubmissionForm3);
    expectedQuestionSubmissionForm1.recipientSubmissionForms[0].commentByGiver = undefined;
    expectedQuestionSubmissionForm1.recipientSubmissionForms[0].responseId = '';
    expectedQuestionSubmissionForm3.recipientSubmissionForms[0].commentByGiver = undefined;
    expectedQuestionSubmissionForm3.recipientSubmissionForms[0].responseId = '';
    expectedQuestionSubmissionForm3.recipientSubmissionForms[1].commentByGiver = undefined;
    expectedQuestionSubmissionForm3.recipientSubmissionForms[1].responseId = '';
    expect(fakeModalRef.componentInstance.questions).toEqual([
      expectedQuestionSubmissionForm1,
      expectedQuestionSubmissionForm2,
      expectedQuestionSubmissionForm3,
    ]);
    expect(fakeModalRef.componentInstance.answers).toEqual({
      'feedback-question-id-1': [testResponse1],
      'feedback-question-id-2': [testResponse2],
    });
    expect(fakeModalRef.componentInstance.notYetAnsweredQuestions).toEqual([]);
    expect(fakeModalRef.componentInstance.failToSaveQuestions).toEqual({});
  });

  it('should create comment request to create new comment', () => {
    const testComment: FeedbackResponseComment = {
      commentGiver: 'comment giver',
      lastEditorEmail: 'last-editor@email.com',
      feedbackResponseCommentId: 911,
      commentText: 'comment text',
      createdAt: 10000000,
      lastEditedAt: 10000000,
      isVisibilityFollowingFeedbackQuestion: true,
      showGiverNameTo: [CommentVisibilityType.GIVER, CommentVisibilityType.INSTRUCTORS],
      showCommentTo: [CommentVisibilityType.GIVER, CommentVisibilityType.INSTRUCTORS],
    };
    const commentSpy: Spy = spyOn(feedbackResponseCommentService, 'createComment').and.returnValue(of(testComment));

    component.createCommentRequest(testRecipientSubmissionForm2).subscribe(() => {
      expect(testRecipientSubmissionForm2.commentByGiver).toEqual(component.getCommentModel(testComment));
    });

    expect(commentSpy.calls.count()).toEqual(1);
    expect(commentSpy.calls.mostRecent().args[0]).toEqual({
      commentText: 'comment text here',
      showCommentTo: [],
      showGiverNameTo: [],
    });
    expect(commentSpy.calls.mostRecent().args[1]).toEqual(testRecipientSubmissionForm2.responseId);
    expect(commentSpy.calls.mostRecent().args[2]).toEqual(Intent.STUDENT_SUBMISSION);
    expect(commentSpy.calls.mostRecent().args[3]).toEqual({ key: testQueryParams.key, moderatedperson: '' });
  });

  it('should create comment request to update existing comment when text is filled', () => {
    const testComment: FeedbackResponseComment = {
      commentGiver: 'comment giver',
      lastEditorEmail: 'last-editor@email.com',
      feedbackResponseCommentId: 999,
      commentText: 'comment text',
      createdAt: 10000000,
      lastEditedAt: 10000000,
      isVisibilityFollowingFeedbackQuestion: true,
      showGiverNameTo: [CommentVisibilityType.GIVER, CommentVisibilityType.INSTRUCTORS],
      showCommentTo: [CommentVisibilityType.GIVER, CommentVisibilityType.INSTRUCTORS],
    };
    const commentSpy: Spy = spyOn(feedbackResponseCommentService, 'updateComment').and.returnValue(of(testComment));
    const originalId: any = testRecipientSubmissionForm1.commentByGiver?.originalComment?.feedbackResponseCommentId;

    component.createCommentRequest(testRecipientSubmissionForm1).subscribe(() => {
      expect(testRecipientSubmissionForm1.commentByGiver).toEqual(component.getCommentModel(testComment));
    });

    expect(commentSpy.calls.count()).toEqual(1);
    expect(commentSpy.calls.mostRecent().args[0]).toEqual({
      commentText: 'comment text here',
      showCommentTo: [],
      showGiverNameTo: [],
    });
    expect(commentSpy.calls.mostRecent().args[1]).toEqual(originalId);
    expect(commentSpy.calls.mostRecent().args[2]).toEqual(Intent.STUDENT_SUBMISSION);
    expect(commentSpy.calls.mostRecent().args[3]).toEqual({ key: testQueryParams.key, moderatedperson: '' });
  });

  it('should create comment request to delete existing comment when text is empty', () => {
    const commentSpy: Spy = spyOn(feedbackResponseCommentService, 'deleteComment').and.returnValue(of({}));
    const originalId: any = testRecipientSubmissionForm3.commentByGiver?.originalComment?.feedbackResponseCommentId;

    component.createCommentRequest(testRecipientSubmissionForm3).subscribe(() => {
      expect(testRecipientSubmissionForm3.commentByGiver).toEqual(undefined);
    });

    expect(commentSpy.calls.count()).toEqual(1);
    expect(commentSpy.calls.mostRecent().args[0]).toEqual(originalId);
    expect(commentSpy.calls.mostRecent().args[1]).toEqual(Intent.STUDENT_SUBMISSION);
    expect(commentSpy.calls.mostRecent().args[2]).toEqual({ key: testQueryParams.key, moderatedperson: '' });
  });

  it('should delete participant comment', () => {
    component.questionSubmissionForms = [testQuestionSubmissionForm1];
    const commentSpy: Spy = spyOn(feedbackResponseCommentService, 'deleteComment').and.returnValue(of(true));
    const originalId: any = testQuestionSubmissionForm1.recipientSubmissionForms[0]
        .commentByGiver?.originalComment?.feedbackResponseCommentId;

    component.deleteParticipantComment(0, 0);

    expect(commentSpy.calls.count()).toEqual(1);
    expect(commentSpy.calls.mostRecent().args[0]).toEqual(originalId);
    expect(commentSpy.calls.mostRecent().args[1]).toEqual(Intent.STUDENT_SUBMISSION);
    expect(commentSpy.calls.mostRecent().args[2]).toEqual({ key: testQueryParams.key, moderatedperson: '' });
  });
});
