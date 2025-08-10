package com.discoverapp.service;

import com.discoverapp.dto.AddToWatchListRequest;
import com.discoverapp.dto.ContentDto;
import com.discoverapp.dto.UpdateWatchListItem;
import com.discoverapp.dto.WatchlistItemDto;
import com.discoverapp.entity.Content;
import com.discoverapp.entity.User;
import com.discoverapp.entity.WatchlistItem;
import com.discoverapp.repository.ContentRepository;
import com.discoverapp.repository.UserRepository;
import com.discoverapp.repository.WatchlistItemRepository;
import com.discoverapp.types.ContentType;
import com.discoverapp.types.WatchListItemStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class WatchlistService {
    @Autowired
    private WatchlistItemRepository watchlistItemRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ContentRepository contentRepository;

    public WatchlistItemDto addWatchlistItem(String username, AddToWatchListRequest dto) {
        System.out.println("Adding watchlist item for user: " + username + ", movieId: " + dto.getMovieId());
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            System.out.println("User not found: " + username);
            throw new IllegalArgumentException("User not found: " + username);
        }
        
        Optional<Content> contentOpt = contentRepository.findById(dto.getMovieId());
        if (contentOpt.isEmpty()) {
            System.out.println("Content not found with ID: " + dto.getMovieId());
            throw new IllegalArgumentException("Content not found with ID: " + dto.getMovieId());
        }
        
        User user = userOpt.get();
        Content content = contentOpt.get();
        
        System.out.println("Found user: " + user.getUsername() + " (ID: " + user.getId() + ")");
        System.out.println("Found content: " + content.getTitle() + " (ID: " + content.getId() + ")");
        
        WatchlistItem item = WatchlistItem.builder()
                .user(user)
                .content(content)
                .status(WatchListItemStatus.valueOf(dto.getStatus()))
                .addedAt(LocalDateTime.now())
                .build();
        
        WatchlistItem savedItem = watchlistItemRepository.save(item);
        System.out.println("Saved watchlist item with ID: " + savedItem.getId());
        
        return toDto(savedItem);
    }

    public WatchlistItemDto updateWatchLIstItem(UpdateWatchListItem dto) {
        Optional<WatchlistItem> watchlistItemOpt = watchlistItemRepository.findById(dto.getId());
        if (watchlistItemOpt.isEmpty()) return null;

        WatchlistItem item = watchlistItemOpt.get();
        item.setStatus(WatchListItemStatus.valueOf(dto.getStatus()));
        item.setAddedAt(LocalDateTime.now());

        watchlistItemRepository.save(item);
        return toDto(item);
    }

    public void removeWatchlistItem(Long id) {
        watchlistItemRepository.deleteById(id);
    }

    public List<WatchlistItemDto> getUserWatchlistByUsername(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found: " + username);
        }
        
        try {
            // Try the optimized query first
            return watchlistItemRepository.findByUserIdWithContent(userOpt.get().getId())
                    .stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Fallback to query without LOB fields
            System.out.println("Falling back to LOB-free query due to: " + e.getMessage());
            return watchlistItemRepository.findByUserIdWithoutLob(userOpt.get().getId())
                    .stream()
                    .map(this::toDtoFromObjectArray)
                    .collect(Collectors.toList());
        }
    }

    public List<WatchlistItemDto> listWatchlistItems(Long userId) {
        try {
            return watchlistItemRepository.findByUserIdWithContent(userId)
                    .stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Fallback to query without LOB fields
            System.out.println("Falling back to LOB-free query due to: " + e.getMessage());
            return watchlistItemRepository.findByUserIdWithoutLob(userId)
                    .stream()
                    .map(this::toDtoFromObjectArray)
                    .collect(Collectors.toList());
        }
    }

    private WatchlistItemDto toDto(WatchlistItem item) {
        WatchlistItemDto dto = new WatchlistItemDto();
        dto.setId(item.getId());
        dto.setUserId(item.getUser() != null ? item.getUser().getId() : null);
        dto.setContentId(item.getContent() != null ? item.getContent().getId() : null);
        dto.setContent(item.getContent() != null ? toContentDto(item.getContent()) : null);
        dto.setStatus(String.valueOf(item.getStatus()));
        dto.setAddedAt(item.getAddedAt());
        return dto;
    }

    private ContentDto toContentDto(Content content) {
        ContentDto dto = new ContentDto();
        dto.setId(content.getId());
        dto.setTitle(content.getTitle());
        
        // Handle LOB fields safely
        try {
            dto.setDescription(content.getDescription());
        } catch (Exception e) {
            dto.setDescription("Description not available");
        }
        
        dto.setPosterUrl(content.getPosterUrl());
        dto.setTrailerUrl(content.getTrailerUrl());
        dto.setRelease_date(content.getReleaseDate());
        
        try {
            dto.setCastList(content.getCastList());
        } catch (Exception e) {
            dto.setCastList("Cast information not available");
        }
        
        dto.setRatings(content.getRatings());
        dto.setType(content.getType());
        dto.setExternalId(content.getExternalId());
        
        // Convert genres safely
        try {
            if (content.getGenres() != null) {
                dto.setGenreIds(content.getGenres().stream()
                        .map(genre -> genre.getId())
                        .collect(Collectors.toList()));
                dto.setGenreNames(content.getGenres().stream()
                        .map(genre -> genre.getName())
                        .collect(Collectors.toList()));
            }
        } catch (Exception e) {
            // If genres cause issues, set empty lists
            dto.setGenreIds(List.of());
            dto.setGenreNames(List.of());
        }
        
        return dto;
    }

    private WatchlistItemDto toDtoFromObjectArray(Object[] row) {
        WatchlistItemDto dto = new WatchlistItemDto();
        
        // Map the object array to DTO
        dto.setId((Long) row[0]);
        dto.setStatus((String) row[1]);
        dto.setAddedAt((LocalDateTime) row[2]);
        
        // Create a minimal ContentDto
        ContentDto contentDto = new ContentDto();
        contentDto.setId((Long) row[3]);
        contentDto.setTitle((String) row[4]);
        contentDto.setPosterUrl((String) row[5]);
        contentDto.setTrailerUrl((String) row[6]);
        contentDto.setRelease_date((LocalDate) row[7]);
        contentDto.setRatings((Double) row[8]);
        contentDto.setType((ContentType) row[9]);
        contentDto.setExternalId((String) row[10]);
        
        dto.setContent(contentDto);
        dto.setContentId(contentDto.getId());
        
        return dto;
    }
} 