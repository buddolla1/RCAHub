package com.syf.rcahub.service;

import com.syf.rcahub.dto.PageResponse;
import com.syf.rcahub.dto.RcaRequest;
import com.syf.rcahub.dto.RcaResponse;
import com.syf.rcahub.dto.RcaSearchCriteria;

public interface RcaService {

    RcaResponse create(RcaRequest request);

    PageResponse<RcaResponse> findAll(RcaSearchCriteria criteria);

    RcaResponse findById(long id);

    RcaResponse update(long id, RcaRequest request);

    void delete(long id);
}
